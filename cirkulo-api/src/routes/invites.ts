import { OpenAPIHono } from "@hono/zod-openapi";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { invites as invitesTable } from "../db/schema";
import { cancelInviteOnChain, registerInvite } from "../lib/blockchain";
import { sendInviteEmail } from "../lib/email";
import { fetchGroup, getLensUsername, isGroupOwner } from "../lib/lens";
import type { AuthContext } from "../lib/middleware";
import { authMiddleware } from "../lib/middleware";
import {
	cancelInviteRoute,
	getInvitesRoute,
	inviteUserRoute,
	markAcceptedRoute,
	resendInviteRoute,
	validateInviteRoute,
} from "../schemas/invites";

const invites = new OpenAPIHono<AuthContext>();

// Validate invite endpoint - PUBLIC (no auth required)
invites.openapi(validateInviteRoute, async (c) => {
	try {
		const { code } = c.req.valid("query");

		console.log(`[ValidateInvite] Validating invite code: ${code}`);

		// Find invite by code
		const [invite] = await db
			.select()
			.from(invitesTable)
			.where(eq(invitesTable.code, code))
			.limit(1);

		if (!invite) {
			return c.json(
				{
					error: "Invite not found",
					details: "No invitation found with this code",
				},
				404,
			);
		}

		// Check expiration
		const now = new Date();
		let status = invite.status;
		if (status === "pending" && invite.expiresAt < now) {
			status = "expired";
		}

		console.log(`[ValidateInvite] Found invite with status: ${status}`);

		// Fetch group details from Lens
		const group = await fetchGroup(invite.groupAddress);

		// Get inviter's Lens username
		const lensUsername = await getLensUsername(invite.senderAddress);
		const inviterName = lensUsername || invite.senderAddress;

		console.log(
			`[ValidateInvite] Group: ${group.name}, Inviter: ${inviterName}`,
		);

		return c.json(
			{
				code: invite.code,
				groupAddress: invite.groupAddress,
				circleName: group.name || "Unnamed Circle",
				circleDescription: group.description,
				inviterName,
				memberCount: undefined, // Not available in our simplified fetchGroup
				createdAt: invite.createdAt.toISOString(),
				expiresAt: invite.expiresAt.toISOString(),
				status,
			},
			200,
		);
	} catch (error) {
		console.error("[ValidateInvite] Error:", error);

		return c.json(
			{
				error: "Failed to validate invite",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

// Apply auth middleware to all protected invite routes
invites.use("/*", authMiddleware);

// Get invites for a group (owner only)
invites.openapi(getInvitesRoute, async (c) => {
	try {
		// Get validated query parameters
		const { groupAddress } = c.req.valid("query");

		// Get authenticated user info from JWT token
		const jwtPayload = c.get("jwtPayload");

		// Extract user address from sub claim
		const userAddress = jwtPayload.sub;

		if (!userAddress) {
			return c.json(
				{
					error: "User information not found",
					details:
						"Unable to retrieve user's address from authentication token (sub claim missing)",
				},
				400,
			);
		}

		console.log(
			`User ${userAddress} is requesting invites for group ${groupAddress}`,
		);

		// Verify user is the owner of the group
		const isOwner = await isGroupOwner(groupAddress, userAddress);

		if (!isOwner) {
			return c.json(
				{
					error: "Forbidden",
					details: "Only the group owner can view invites for this group",
				},
				403,
			);
		}

		console.log(`✅ User is owner of group ${groupAddress}`);

		// Fetch all invites for the group
		const groupInvites = await db
			.select()
			.from(invitesTable)
			.where(eq(invitesTable.groupAddress, groupAddress))
			.orderBy(desc(invitesTable.createdAt));

		console.log(
			`📧 Found ${groupInvites.length} invites for group ${groupAddress}`,
		);

		// Format response with ISO 8601 timestamps
		const formattedInvites = groupInvites.map((invite) => ({
			id: invite.id,
			code: invite.code,
			recipientEmail: invite.recipientEmail,
			groupAddress: invite.groupAddress,
			senderAddress: invite.senderAddress,
			status: invite.status,
			expiresAt: invite.expiresAt.toISOString(),
			acceptedAt: invite.acceptedAt?.toISOString(),
			registeredTxHash: invite.registeredTxHash || undefined,
			createdAt: invite.createdAt.toISOString(),
			updatedAt: invite.updatedAt.toISOString(),
		}));

		return c.json(formattedInvites, 200);
	} catch (error) {
		console.error("Error fetching invites:", error);

		return c.json(
			{
				error: "Failed to fetch invites",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

// Invite user endpoint
invites.openapi(inviteUserRoute, async (c) => {
	try {
		// Get validated request body
		const body = c.req.valid("json");
		const { recipientEmail, groupAddress } = body;

		// Get authenticated user info from JWT token
		const jwtPayload = c.get("jwtPayload");

		// Extract sender address from sub claim
		const senderAddress = jwtPayload.sub;

		if (!senderAddress) {
			return c.json(
				{
					error: "Sender information not found",
					details:
						"Unable to retrieve sender's address from authentication token (sub claim missing)",
				},
				400,
			);
		}

		console.log(
			`User ${senderAddress} is inviting ${recipientEmail} to group ${groupAddress}`,
		);

		// 1. Verify sender is the owner of the group
		const isOwner = await isGroupOwner(groupAddress, senderAddress);

		if (!isOwner) {
			return c.json(
				{
					error: "Forbidden",
					details: "Only the group owner can send invites",
				},
				403,
			);
		}

		console.log(`✅ User is owner of group ${groupAddress}`);

		// 2. Fetch Lens account username
		const lensUsername = await getLensUsername(senderAddress);
		const inviterName = lensUsername || senderAddress; // Fallback to address if no username

		console.log(
			`Lens username: ${lensUsername || "not found"}, using: ${inviterName}`,
		);

		// 3. Check for existing invite (pending or accepted)
		const existingInvite = await db
			.select()
			.from(invitesTable)
			.where(
				and(
					eq(invitesTable.recipientEmail, recipientEmail),
					eq(invitesTable.groupAddress, groupAddress),
				),
			)
			.limit(1);

		if (existingInvite.length > 0) {
			const invite = existingInvite[0];

			if (invite.status === "accepted") {
				return c.json(
					{
						error: "User already joined",
						details: `${recipientEmail} has already accepted an invite and joined this group`,
					},
					400,
				);
			}

			if (invite.status === "pending") {
				return c.json(
					{
						error: "Invite already exists",
						details: `An active invite for ${recipientEmail} to this group already exists`,
					},
					400,
				);
			}
		}

		// 4. Fetch group details from Lens Protocol to get configSalt
		const group = await fetchGroup(groupAddress);
		const configSalt = group.configSalt;

		console.log(`Using configSalt: ${configSalt} for group ${groupAddress}`);

		// 5. Set expiration to 7 days from now
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		// 6. Create invite record in database
		const [newInvite] = await db
			.insert(invitesTable)
			.values({
				recipientEmail,
				senderAddress,
				groupAddress,
				configSalt,
				expiresAt,
				status: "pending",
			})
			.returning();

		console.log(`✅ Invite created in database: ${newInvite.id}`);

		// 7. Register invite on-chain
		let txHash: string | undefined;
		try {
			txHash = await registerInvite({
				configSalt,
				senderAddress,
				inviteCode: newInvite.code,
				expiresAt,
			});

			console.log(`✅ Invite registered on-chain: ${txHash}`);

			// Update database with transaction hash
			await db
				.update(invitesTable)
				.set({ registeredTxHash: txHash })
				.where(eq(invitesTable.id, newInvite.id));
		} catch (blockchainError) {
			console.error("❌ Failed to register invite on-chain:", blockchainError);

			// Clean up the database record since blockchain registration failed
			await db.delete(invitesTable).where(eq(invitesTable.id, newInvite.id));

			console.log(
				`🗑️ Deleted invite ${newInvite.id} from database due to blockchain failure`,
			);

			// Return error response
			return c.json(
				{
					error: "Failed to register invite on blockchain",
					details:
						blockchainError instanceof Error
							? blockchainError.message
							: "Unknown blockchain error",
				},
				500,
			);
		}

		// 8. Send invite email with Lens username
		const emailResult = await sendInviteEmail({
			to: recipientEmail,
			inviterName,
			inviteToken: newInvite.code,
		});

		// Return success response
		return c.json(
			{
				recipientEmail,
				groupAddress,
				inviteId: newInvite.id,
				inviteCode: newInvite.code,
				txHash,
				emailId: emailResult.data?.id,
			},
			200,
		);
	} catch (error) {
		console.error("Error sending invite:", error);

		// Generic error response
		return c.json(
			{
				error: "Failed to send invite",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

// Resend invite endpoint
invites.openapi(resendInviteRoute, async (c) => {
	try {
		// Get invite ID from path parameter
		const { id } = c.req.valid("param");

		// Get authenticated user info from JWT token
		const jwtPayload = c.get("jwtPayload");

		// Extract sender address from sub claim
		const senderAddress = jwtPayload.sub;

		if (!senderAddress) {
			return c.json(
				{
					error: "Sender information not found",
					details:
						"Unable to retrieve sender's address from authentication token (sub claim missing)",
				},
				400,
			);
		}

		// Find the invite
		const [invite] = await db
			.select()
			.from(invitesTable)
			.where(eq(invitesTable.id, id))
			.limit(1);

		if (!invite) {
			return c.json(
				{
					error: "Invite not found",
					details: `No invite found with ID: ${id}`,
				},
				404,
			);
		}

		// Check if the invite belongs to the authenticated user
		if (invite.senderAddress !== senderAddress) {
			return c.json(
				{
					error: "Unauthorized",
					details: "You can only resend your own invites",
				},
				401,
			);
		}

		// Check if invite is in pending status
		if (invite.status !== "pending") {
			return c.json(
				{
					error: "Cannot resend invite",
					details: `Invite is ${invite.status}. Only pending invites can be resent.`,
				},
				400,
			);
		}

		// Fetch Lens username for the sender
		const lensUsername = await getLensUsername(senderAddress);
		const inviterName = lensUsername || senderAddress;

		console.log(
			`Resending invite ${id} from ${inviterName} to ${invite.recipientEmail}`,
		);

		// Resend the invite email
		const emailResult = await sendInviteEmail({
			to: invite.recipientEmail,
			inviterName,
			inviteToken: invite.code,
		});

		// Return success response
		return c.json(
			{
				inviteId: invite.id,
				emailId: emailResult.data?.id,
			},
			200,
		);
	} catch (error) {
		console.error("Error resending invite:", error);

		return c.json(
			{
				error: "Failed to resend invite",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

// Cancel invite endpoint
invites.openapi(cancelInviteRoute, async (c) => {
	try {
		// Get invite ID from path parameter
		const { id } = c.req.valid("param");

		// Get authenticated user info from JWT token
		const jwtPayload = c.get("jwtPayload");

		// Extract sender address from sub claim
		const senderAddress = jwtPayload.sub;

		if (!senderAddress) {
			return c.json(
				{
					error: "Sender information not found",
					details:
						"Unable to retrieve sender's address from authentication token (sub claim missing)",
				},
				400,
			);
		}

		// Find the invite
		const [invite] = await db
			.select()
			.from(invitesTable)
			.where(eq(invitesTable.id, id))
			.limit(1);

		if (!invite) {
			return c.json(
				{
					error: "Invite not found",
					details: `No invite found with ID: ${id}`,
				},
				404,
			);
		}

		// Check if the invite belongs to the authenticated user
		if (invite.senderAddress !== senderAddress) {
			return c.json(
				{
					error: "Unauthorized",
					details: "You can only cancel your own invites",
				},
				401,
			);
		}

		// Check if invite is already cancelled
		if (invite.status === "cancelled") {
			return c.json(
				{
					error: "Invite already cancelled",
					details: "This invite has already been cancelled",
				},
				400,
			);
		}

		// Check if invite is in a cancellable state
		if (invite.status !== "pending") {
			return c.json(
				{
					error: "Cannot cancel invite",
					details: `Invite is ${invite.status}. Only pending invites can be cancelled.`,
				},
				400,
			);
		}

		console.log(`Cancelling invite ${id} by ${senderAddress}`);

		// Cancel invite on-chain first
		try {
			await cancelInviteOnChain({
				configSalt: invite.configSalt,
				inviteCode: invite.code,
			});
			console.log(`✅ Invite ${id} cancelled on-chain`);
		} catch (blockchainError) {
			console.error("❌ Failed to cancel invite on-chain:", blockchainError);

			// Return error - don't cancel in DB if blockchain fails
			return c.json(
				{
					error: "Failed to cancel invite on blockchain",
					details:
						blockchainError instanceof Error
							? blockchainError.message
							: "Unknown blockchain error",
				},
				500,
			);
		}

		// Update invite status to cancelled in database
		const [cancelledInvite] = await db
			.update(invitesTable)
			.set({
				status: "cancelled",
				updatedAt: new Date(),
			})
			.where(eq(invitesTable.id, id))
			.returning();

		console.log(`✅ Invite ${id} marked as cancelled in database`);

		// Return success response
		return c.json(
			{
				inviteId: cancelledInvite.id,
			},
			200,
		);
	} catch (error) {
		console.error("Error cancelling invite:", error);

		return c.json(
			{
				error: "Failed to cancel invite",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

// Mark Accepted endpoint - called after user successfully joins on-chain
invites.openapi(markAcceptedRoute, async (c) => {
	try {
		const body = c.req.valid("json");
		const { inviteCode, txHash } = body;

		console.log(`📝 Marking invite ${inviteCode} as accepted (tx: ${txHash})`);

		// 1. Find invite
		const [invite] = await db
			.select()
			.from(invitesTable)
			.where(eq(invitesTable.code, inviteCode))
			.limit(1);

		if (!invite) {
			return c.json(
				{
					error: "Invite not found",
					details: `No invite found with code: ${inviteCode}`,
				},
				404,
			);
		}

		// 2. Idempotent check - if already accepted, return success
		if (invite.status === "accepted") {
			console.log(`✅ Invite already marked as accepted`);
			return c.json(
				{
					inviteId: invite.id,
					groupAddress: invite.groupAddress,
					acceptedAt:
						invite.acceptedAt?.toISOString() || new Date().toISOString(),
				},
				200,
			);
		}

		// 3. Update invite status
		const [updatedInvite] = await db
			.update(invitesTable)
			.set({
				status: "accepted",
				acceptedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(invitesTable.id, invite.id))
			.returning();

		console.log(`✅ Invite ${inviteCode} marked as accepted`);

		return c.json(
			{
				inviteId: updatedInvite.id,
				groupAddress: updatedInvite.groupAddress,
				acceptedAt:
					updatedInvite.acceptedAt?.toISOString() || new Date().toISOString(),
			},
			200,
		);
	} catch (error) {
		console.error("❌ Error marking invite as accepted:", error);

		return c.json(
			{
				error: "Failed to mark invite as accepted",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

export default invites;
