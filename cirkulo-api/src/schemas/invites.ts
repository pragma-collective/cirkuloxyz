import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

// Request Schema - removed senderName, now extracted from JWT
export const InviteUserSchema = z.object({
	recipientEmail: z
		.string()
		.email()
		.describe("Email address of the user to invite")
		.openapi({ example: "newuser@example.com" }),
	groupAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
		.describe("Ethereum address of the group")
		.openapi({ example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" }),
});

// Response Schema
export const InviteResponseSchema = z.object({
	success: z.boolean().describe("Whether the invite was sent successfully"),
	message: z.string().describe("Success message"),
	recipientEmail: z
		.string()
		.email()
		.describe("Email address the invite was sent to"),
	groupAddress: z.string().describe("Group address the invite is for"),
	inviteId: z.string().describe("Database ID of the created invite"),
	emailId: z.string().optional().describe("Email service provider ID"),
});

// Error Schema
export const ErrorSchema = z.object({
	error: z.string().describe("Error message"),
	details: z.string().optional().describe("Additional error details"),
});

// Route Definition
export const inviteUserRoute = createRoute({
	method: "post",
	path: "/send",
	tags: ["Invites"],
	summary: "Invite a user to a group",
	description:
		"Sends an email invitation to a user to join a specific group. Requires authentication. The sender information is automatically extracted from the authentication token.",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: InviteUserSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Invite sent successfully",
			content: {
				"application/json": {
					schema: InviteResponseSchema,
				},
			},
		},
		400: {
			description:
				"Invalid request data, invite already exists, or user already joined the group",
			content: {
				"application/json": {
					schema: ErrorSchema,
				},
			},
		},
		401: {
			description: "Unauthorized - Invalid or missing authentication token",
			content: {
				"application/json": {
					schema: ErrorSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: ErrorSchema,
				},
			},
		},
	},
});
