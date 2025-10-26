import { createRoute, z } from "@hono/zod-openapi";

/**
 * Schema for funding a user's wallet
 * No body required - uses authenticated user's address from JWT
 */
const fundWalletSchema = z.object({});

/**
 * Response schema for successful funding
 */
const fundWalletResponseSchema = z.object({
	success: z.boolean().openapi({
		description: "Whether the funding was successful",
		example: true,
	}),
	cbtcTransactionHash: z.string().openapi({
		description: "Transaction hash of the CBTC funding transaction",
		example:
			"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
	}),
	cusdTransactionHash: z.string().openapi({
		description: "Transaction hash of the CUSD funding transaction",
		example:
			"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
	}),
	recipientAddress: z.string().openapi({
		description: "Address that received the funds",
		example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
	}),
	cbtcAmount: z.string().openapi({
		description: "Amount of CBTC sent (in wei)",
		example: "100000000000000",
	}),
	cusdAmount: z.string().openapi({
		description: "Amount of CUSD sent (in wei, 18 decimals)",
		example: "50000000000000000000",
	}),
});

/**
 * Error response schema
 */
const fundWalletErrorSchema = z.object({
	error: z.string(),
	details: z.string().optional(),
});

/**
 * POST /onramp/fund - Fund the authenticated user's wallet with CBTC and CUSD from backend wallet
 */
export const fundWalletRoute = createRoute({
	method: "post",
	path: "/fund",
	tags: ["On-ramp"],
	summary: "Fund authenticated user's wallet with CBTC and CUSD",
	description:
		"Transfers CBTC and 50 CUSD tokens from the backend wallet to the authenticated user's address (from JWT sub claim) on Citrea testnet",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: fundWalletSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: fundWalletResponseSchema,
				},
			},
			description: "Successfully funded the wallet",
		},
		400: {
			content: {
				"application/json": {
					schema: fundWalletErrorSchema,
				},
			},
			description: "Invalid request parameters",
		},
		401: {
			content: {
				"application/json": {
					schema: fundWalletErrorSchema,
				},
			},
			description: "Unauthorized - Invalid or missing authentication token",
		},
		500: {
			content: {
				"application/json": {
					schema: fundWalletErrorSchema,
				},
			},
			description: "Internal server error",
		},
		503: {
			content: {
				"application/json": {
					schema: fundWalletErrorSchema,
				},
			},
			description: "Service unavailable - Faucet is out of funds",
		},
	},
});
