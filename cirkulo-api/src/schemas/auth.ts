import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

// Schema for JWT validation response - allow any additional fields
export const JWTPayloadSchema = z
	.object({
		iss: z.string().optional().describe("Issuer"),
		sub: z.string().optional().describe("Subject"),
		aud: z
			.union([z.string(), z.array(z.string())])
			.optional()
			.describe("Audience"),
		exp: z.number().optional().describe("Expiration time"),
		iat: z.number().optional().describe("Issued at"),
		nbf: z.number().optional().describe("Not before"),
		jti: z.string().optional().describe("JWT ID"),
	})
	.passthrough();

// Schema for error responses
export const ErrorSchema = z.object({
	error: z.string().describe("Error message"),
	details: z.string().optional().describe("Detailed error information"),
});

// Route definition for JWT validation
export const validateJWTRoute = createRoute({
	method: "get",
	path: "/validate",
	tags: ["Authentication"],
	summary: "Validate JWT token",
	description:
		"Validates a JWT token provided in the Authorization header and returns the decoded payload",
	security: [
		{
			bearerAuth: [],
		},
	],
	request: {
		headers: z.object({
			authorization: z
				.string()
				.describe("Bearer token in format: Bearer <token>")
				.openapi({
					example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
				}),
		}),
	},
	responses: {
		200: {
			description: "Successfully validated JWT token",
			content: {
				"application/json": {
					schema: JWTPayloadSchema,
				},
			},
		},
		401: {
			description: "Invalid or expired token",
			content: {
				"application/json": {
					schema: ErrorSchema,
				},
			},
		},
	},
});
