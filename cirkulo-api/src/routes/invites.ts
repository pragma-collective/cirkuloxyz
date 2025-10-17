import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { invites as invitesTable } from "../db/schema";
import { sendInviteEmail } from "../lib/email";
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
		const user = c.get("user");
		const senderId = user.sub as string | undefined; // Dynamic user ID from JWT sub claim
		const senderEmail = user.email as string | undefined; // Sender's email from JWT

		if (!senderId || !senderEmail) {
			return c.json(
				{
					error: "Sender information not found",
					details:
						"Unable to retrieve sender's ID or email from authentication token",
				},
				400,
			);
		}

		console.log(
			`User ${senderId} (${senderEmail}) is inviting ${recipientEmail} to group ${groupAddress}`,
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
				senderId,
				groupAddress,
				status: "pending",
			})
			.returning();

		// Send invite email
		const emailResult = await sendInviteEmail({
			to: recipientEmail,
			inviterEmail: senderEmail,
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
