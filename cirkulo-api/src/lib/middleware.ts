import type { Context, Next } from "hono";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { extractToken, validateJWT } from "./auth";

// Extend Hono context to include user info
export type AuthContext = {
	Variables: {
		user: JwtPayload;
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
}
