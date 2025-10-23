import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

// Circle type enum
const circleTypeEnum = z.enum(["contribution", "rotating", "fundraising"]);

// Currency enum
const currencyEnum = z.enum(["cusd", "cbtc"]);

// Create Circle Request Schema
export const CreateCircleSchema = z.object({
	circleName: z
		.string()
		.min(1, "Circle name is required")
		.max(50, "Circle name must be no more than 50 characters")
		.describe("Non-slugified circle name")
		.openapi({ example: "Summer Vacation Fund" }),
	poolAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
		.describe("Xersha pool contract address")
		.openapi({ example: "0x1234567890123456789012345678901234567890" }),
	lensGroupAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
		.describe("Lens group contract address")
		.openapi({ example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" }),
	poolDeploymentTxHash: z
		.string()
		.regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash")
		.optional()
		.describe("Pool creation transaction hash")
		.openapi({
			example:
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
		}),
	circleType: circleTypeEnum.describe("Type of circle/pool"),
	currency: currencyEnum.default("cusd").describe("Currency type for the pool (cusd or cbtc)").openapi({ example: "cusd" }),
});

// Create Circle Response Schema
export const CreateCircleResponseSchema = z.object({
	success: z.boolean().describe("Whether the circle was created successfully"),
	message: z.string().describe("Success message"),
	data: z.object({
		id: z.string().describe("Database ID of the created circle"),
		circleName: z.string().describe("Circle name"),
		poolAddress: z.string().describe("Pool contract address"),
		lensGroupAddress: z.string().describe("Lens group address"),
		circleType: circleTypeEnum.describe("Circle type"),
		currency: currencyEnum.describe("Currency type"),
		creatorAddress: z.string().describe("Creator's address"),
		createdAt: z.string().describe("Creation timestamp"),
	}),
});

// Get Circle Response Schema
export const GetCircleResponseSchema = z.object({
	success: z.boolean().describe("Whether the circle was found"),
	data: z
		.object({
			id: z.string().describe("Database ID"),
			circleName: z.string().describe("Circle name"),
			poolAddress: z.string().describe("Pool contract address"),
			lensGroupAddress: z.string().describe("Lens group address"),
			poolDeploymentTxHash: z
				.string()
				.nullable()
				.describe("Pool deployment transaction hash"),
			circleType: circleTypeEnum.describe("Circle type"),
			currency: currencyEnum.describe("Currency type"),
			creatorAddress: z.string().describe("Creator's address"),
			createdAt: z.string().describe("Creation timestamp"),
			updatedAt: z.string().describe("Last update timestamp"),
		})
		.nullable(),
});

// Error Schema
export const ErrorSchema = z.object({
	error: z.string().describe("Error message"),
	details: z.string().optional().describe("Additional error details"),
});

// Path Parameter Schema for getting circle by address
export const CircleAddressParamSchema = z.object({
	address: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
		.describe("Lens group address or pool address"),
});

// Create Circle Route Definition
export const createCircleRoute = createRoute({
	method: "post",
	path: "/create",
	tags: ["Circles"],
	summary: "Create a new circle",
	description:
		"Stores circle configuration in the database after pool deployment. Requires authentication. Creator address is extracted from JWT token.",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateCircleSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Circle created successfully",
			content: {
				"application/json": {
					schema: CreateCircleResponseSchema,
				},
			},
		},
		400: {
			description: "Invalid request data or duplicate circle",
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

// Get Circle Route Definition
export const getCircleRoute = createRoute({
	method: "get",
	path: "/{address}",
	tags: ["Circles"],
	summary: "Get circle by address",
	description:
		"Retrieves circle configuration by lens group address or pool address. No authentication required.",
	request: {
		params: CircleAddressParamSchema,
	},
	responses: {
		200: {
			description: "Circle found",
			content: {
				"application/json": {
					schema: GetCircleResponseSchema,
				},
			},
		},
		404: {
			description: "Circle not found",
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
