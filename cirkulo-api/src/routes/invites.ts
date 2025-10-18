import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { invites as invitesTable } from "../db/schema";
import { sendInviteEmail } from "../lib/email";
import { getLensUsername } from "../lib/lens";
import type { AuthContext } from "../lib/middleware";
import { authMiddleware } from "../lib/middleware";
import { inviteUserRoute } from "../schemas/invites";

const invites = new OpenAPIHono<AuthContext>();

// Apply auth middleware to all invite routes
invites.use("/*", authMiddleware);

// Invite user endpoint
invites.openapi(inviteUserRoute, async (c) => {
	try {
		// Get validated request body
		const body = c.req.valid("json");
		const { recipientEmail, groupAddress } = body;

		// Get authenticated user info from JWT token
		const jwtPayload = c.get("jwtPayload");

		// Extract sender address from act claim (Account address the token can act on behalf of)
		// @ts-expect-error - act claim is not in the standard JWTPayload type
		const senderAddress = jwtPayload.act?.sub as string | undefined;

		if (!senderAddress) {
			return c.json(
				{
					error: "Sender information not found",
					details:
						"Unable to retrieve sender's address from authentication token (act.sub claim missing)",
				},
				400,
			);
		}

		console.log(
			`User ${senderAddress} is inviting ${recipientEmail} to group ${groupAddress}`,
		);

		// Fetch Lens account username
		const lensUsername = await getLensUsername(senderAddress);
		const inviterName = lensUsername || senderAddress; // Fallback to address if no username

		console.log(
			`Lens username: ${lensUsername || "not found"}, using: ${inviterName}`,
		);

		// Check for existing invite (pending or accepted)
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

		// Create invite record in database
		const [newInvite] = await db
			.insert(invitesTable)
			.values({
				recipientEmail,
				senderAddress,
				groupAddress,
				status: "pending",
			})
			.returning();

		// Send invite email with Lens username
		const emailResult = await sendInviteEmail({
			to: recipientEmail,
			inviterName,
		});

		// Return success response
		return c.json(
			{
				success: true,
				message: "Invitation sent successfully",
				recipientEmail,
				groupAddress,
				inviteId: newInvite.id,
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

export default invites;
