import { OpenAPIHono } from "@hono/zod-openapi";
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
		const { email } = body;

		// Get authenticated user info from context
		const user = c.get("user");

		// Extract inviter's name from JWT token
		// Try to get the full name first, fall back to given_name, alias, or email
		const inviterName =
			user.given_name && user.family_name
				? `${user.given_name} ${user.family_name}`
				: user.given_name || user.alias || user.email || "Someone";

		console.log(
			`User ${user.sub} (${inviterName}) is inviting ${email} to join their circle`,
		);

		// Send invite email
		// TODO: Generate invite token if needed for tracking/validation
		const emailResult = await sendInviteEmail({
			to: email,
			inviterName,
		});

		// Return success response
		return c.json(
			{
				success: true,
				message: "Invitation sent successfully",
				email,
				emailId: emailResult.data?.id,
			},
			200,
		);
	} catch (error) {
		console.error("Error sending invite:", error);

		// Handle specific error cases
		if (error instanceof Error) {
			if (error.message.includes("email")) {
				return c.json(
					{
						error: "Failed to send invite email",
						details: error.message,
					},
					500,
				);
			}
		}

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
