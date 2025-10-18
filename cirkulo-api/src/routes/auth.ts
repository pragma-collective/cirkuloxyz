import { OpenAPIHono } from "@hono/zod-openapi";
import { extractToken, validateJWT } from "../lib/auth";
import { validateJWTRoute } from "../schemas/auth";

const auth = new OpenAPIHono();

// Validate JWT endpoint
auth.openapi(validateJWTRoute, async (c) => {
	try {
		// Get Authorization header
		const authHeader = c.req.header("Authorization");
		const token = extractToken(authHeader);

		if (!token) {
			return c.json({ error: "Authorization header missing or invalid" }, 401);
		}

		// Validate the JWT using Lens Protocol
		const decodedToken = await validateJWT(token);

		// Return decoded token directly with 200 status
		return c.json(decodedToken, 200);
	} catch (error) {
		// Handle jose verification errors
		if (error instanceof Error) {
			return c.json(
				{ error: "Invalid or expired token", details: error.message },
				401,
			);
		}
		return c.json(
			{
				error: "Authentication failed",
				details: "Unknown error",
			},
			401,
		);
	}
});

export default auth;
