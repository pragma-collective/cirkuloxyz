import { OpenAPIHono } from "@hono/zod-openapi";
import jwt from "jsonwebtoken";
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

		// Validate the JWT
		const decodedToken = await validateJWT(token);

		// Return decoded token directly with 200 status
		return c.json(decodedToken, 200);
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return c.json({ error: "Invalid token", details: error.message }, 401);
		}
		if (error instanceof jwt.TokenExpiredError) {
			return c.json({ error: "Token expired", details: error.message }, 401);
		}
		return c.json(
			{
				error: "Authentication failed",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			401,
		);
	}
});

export default auth;
