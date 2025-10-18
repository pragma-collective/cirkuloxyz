import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";
import { getJwksUri } from "./lens";

// Get JWKS URI based on LENS_ENVIRONMENT
const jwksUri = getJwksUri();

// Initialize JWKS with jose's createRemoteJWKSet
const JWKS = createRemoteJWKSet(new URL(jwksUri));

// Validate JWT token using Lens Protocol
export async function validateJWT(token: string): Promise<JWTPayload> {
	try {
		// Verify the JWT using the JWKS
		const { payload } = await jwtVerify(token, JWKS);

		// Check for additional auth requirements if needed
		if (
			payload?.scopes &&
			Array.isArray(payload.scopes) &&
			payload.scopes.includes("requiresAdditionalAuth")
		) {
			throw new Error("Additional verification required (e.g., MFA)");
		}

		return payload;
	} catch (error) {
		// Re-throw with more specific error messages
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("JWT verification failed");
	}
}

// Extract token from Authorization header
export function extractToken(authHeader: string | undefined): string | null {
	if (!authHeader) {
		return null;
	}

	return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
}
