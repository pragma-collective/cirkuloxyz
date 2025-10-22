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
	recipientEmail: z
		.string()
		.email()
		.describe("Email address the invite was sent to"),
	groupAddress: z.string().describe("Group address the invite is for"),
	inviteId: z.string().describe("Database ID of the created invite"),
	inviteCode: z.string().describe("Invite code (UUID)"),
	txHash: z
		.string()
		.optional()
		.describe("Transaction hash from on-chain registration"),
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
		403: {
			description: "Forbidden - User is not a member of the group",
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

// Path Parameter Schema
export const InviteIdParamSchema = z.object({
	id: z.string().uuid().describe("Unique identifier of the invite"),
});

// Resend Response Schema
export const ResendInviteResponseSchema = z.object({
	inviteId: z.string().describe("Database ID of the invite"),
	emailId: z.string().optional().describe("Email service provider ID"),
});

// Cancel Response Schema
export const CancelInviteResponseSchema = z.object({
	inviteId: z.string().describe("Database ID of the cancelled invite"),
});

// Resend Invite Route Definition
export const resendInviteRoute = createRoute({
	method: "post",
	path: "/{id}/resend",
	tags: ["Invites"],
	summary: "Resend a pending invite",
	description:
		"Resends an email invitation for a pending invite. Only pending invites can be resent. Requires authentication.",
	security: [{ bearerAuth: [] }],
	request: {
		params: InviteIdParamSchema,
	},
	responses: {
		200: {
			description: "Invite resent successfully",
			content: {
				"application/json": {
					schema: ResendInviteResponseSchema,
				},
			},
		},
		400: {
			description:
				"Invite cannot be resent (not found, not pending, or wrong status)",
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
		404: {
			description: "Invite not found",
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

// Cancel Invite Route Definition
export const cancelInviteRoute = createRoute({
	method: "post",
	path: "/{id}/cancel",
	tags: ["Invites"],
	summary: "Cancel an invite",
	description:
		"Cancels a pending invite by updating its status to cancelled. Only pending invites can be cancelled. Requires authentication.",
	security: [{ bearerAuth: [] }],
	request: {
		params: InviteIdParamSchema,
	},
	responses: {
		200: {
			description: "Invite cancelled successfully",
			content: {
				"application/json": {
					schema: CancelInviteResponseSchema,
				},
			},
		},
		400: {
			description:
				"Invite cannot be cancelled (not found, not pending, or already cancelled)",
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
		404: {
			description: "Invite not found",
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

// Mark Accepted Schema - for when user successfully joins on-chain
export const MarkAcceptedSchema = z.object({
	inviteCode: z
		.string()
		.uuid()
		.describe("UUID of the invite")
		.openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
	txHash: z
		.string()
		.describe("Transaction hash of the join operation")
		.openapi({ example: "0x1234567890abcdef..." }),
});

export const MarkAcceptedResponseSchema = z.object({
	inviteId: z.string(),
	groupAddress: z.string(),
	acceptedAt: z.string(),
});

export const markAcceptedRoute = createRoute({
	method: "post",
	path: "/mark-accepted",
	tags: ["Invites"],
	summary: "Mark invite as accepted",
	description:
		"Called after user successfully joins the group on-chain. Updates database status.",
	request: {
		body: {
			content: {
				"application/json": {
					schema: MarkAcceptedSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Invite marked as accepted",
			content: {
				"application/json": {
					schema: MarkAcceptedResponseSchema,
				},
			},
		},
		404: {
			description: "Invite not found",
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

// Get Invites Query Schema
export const GetInvitesQuerySchema = z.object({
	groupAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
		.describe("Ethereum address of the group to filter invites")
		.openapi({ example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" }),
});

// Invite Item Schema
export const InviteItemSchema = z.object({
	id: z.string().uuid().describe("Database ID of the invite"),
	code: z.string().uuid().describe("Invite code (UUID)"),
	recipientEmail: z.string().email().describe("Email address of the recipient"),
	groupAddress: z
		.string()
		.describe("Ethereum address of the group the invite is for"),
	senderAddress: z
		.string()
		.describe("Ethereum address of the user who sent the invite"),
	status: z
		.enum(["pending", "accepted", "expired", "cancelled"])
		.describe("Current status of the invite"),
	expiresAt: z.string().describe("ISO 8601 timestamp when invite expires"),
	acceptedAt: z
		.string()
		.optional()
		.describe("ISO 8601 timestamp when invite was accepted"),
	registeredTxHash: z
		.string()
		.optional()
		.describe("Transaction hash from on-chain registration"),
	createdAt: z.string().describe("ISO 8601 timestamp when invite was created"),
	updatedAt: z
		.string()
		.describe("ISO 8601 timestamp when invite was last updated"),
});

// Get Invites Response Schema - returns array directly
export const GetInvitesResponseSchema = z.array(InviteItemSchema);

// Get Invites Route Definition
export const getInvitesRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Invites"],
	summary: "Get invites for a group",
	description:
		"Retrieves all invites for a specific group. Only the group owner can access this endpoint. Requires authentication.",
	security: [{ bearerAuth: [] }],
	request: {
		query: GetInvitesQuerySchema,
	},
	responses: {
		200: {
			description: "Invites retrieved successfully",
			content: {
				"application/json": {
					schema: GetInvitesResponseSchema,
				},
			},
		},
		400: {
			description:
				"Invalid request - missing or invalid groupAddress parameter",
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
		403: {
			description: "Forbidden - User is not the owner of the group",
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
