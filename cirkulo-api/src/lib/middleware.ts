import type { Context, Next } from "hono";
import type { JWTPayload } from "jose";
import { extractToken, validateJWT } from "./auth";

// Extend Hono context to include user info
export type AuthContext = {
	Variables: {
		user: JWTPayload;
	};
};

/**
 * Authentication middleware for protected routes
 * Validates JWT token from Authorization header and attaches user to context
 */
export async function authMiddleware(c: Context, next: Next) {
	try {
		const authHeader = c.req.header("Authorization");
		const token = extractToken(authHeader);

		if (!token) {
			return c.json({ error: "Authorization header missing or invalid" }, 401);
		}

		// Validate JWT and get decoded token
		const decodedToken = await validateJWT(token);

		// Attach user to context for downstream handlers
		c.set("user", decodedToken);

		await next();
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
}
