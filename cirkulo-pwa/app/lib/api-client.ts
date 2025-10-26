/**
 * API Client for backend communication
 * Handles Lens authentication and request formatting
 */

import type { SessionClient } from "@lens-protocol/client";
import { refresh } from "@lens-protocol/client/actions";

const API_BASE_URL = import.meta.env.VITE_LENS_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public details?: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

/**
 * Decode JWT token to check expiration
 */
function decodeJWT(token: string): { exp: number } | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		
		const payload = JSON.parse(atob(parts[1]));
		return payload;
	} catch {
		return null;
	}
}

/**
 * Check if a JWT token is expired or will expire soon
 * @param token - JWT token to check
 * @param bufferMinutes - Minutes before expiration to consider token as "expired" (default: 5)
 * @returns true if token is expired or expiring soon
 */
function isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
	const decoded = decodeJWT(token);
	if (!decoded?.exp) return false;
	
	const expiresAt = new Date(decoded.exp * 1000);
	const now = new Date();
	
	// Calculate minutes until expiration
	const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / 1000 / 60;
	
	console.log(`[ApiClient] Token expires in ${minutesUntilExpiry.toFixed(2)} minutes`);
	
	// Token is expired or expiring soon if minutes until expiry is less than buffer
	return minutesUntilExpiry < bufferMinutes;
}

/**
 * Get authentication token from the provided session client
 * Automatically refreshes the token if it's expired or expiring soon
 */
async function getAuthToken(sessionClient: SessionClient | null): Promise<string | null> {
	if (!sessionClient) {
		console.warn("[ApiClient] No active Lens session");
		return null;
	}

	try {
		// Get current credentials
		const credentialsResult = sessionClient.getCredentials();
		
		if (credentialsResult.isErr()) {
			console.warn("[ApiClient] Failed to get credentials:", credentialsResult.error);
			return null;
		}

		const credentials = credentialsResult.value;
		if (!credentials) {
			console.warn("[ApiClient] Credentials are null");
			return null;
		}

		// Check if ID token is expired or expiring soon (within 5 minutes)
		if (isTokenExpired(credentials.idToken, 5)) {
			console.log("[ApiClient] ID token is expired or expiring soon, refreshing...");
			
			// @TODO: verify if this is actually the correct way to refresh credentials since it is not in the documentation
			// Refresh credentials using the refresh token
			const refreshResult = await refresh(sessionClient, {
				refreshToken: credentials.refreshToken,
			});

			if (refreshResult.isErr()) {
				console.error("[ApiClient] Failed to refresh credentials:", refreshResult.error);
				// Return the old token as fallback
				return credentials.idToken;
			}

			const newCredentials = refreshResult.value;
			
			// Check if refresh returned an error
			if (newCredentials.__typename === "ForbiddenError") {
				console.error("[ApiClient] Refresh forbidden:", newCredentials.reason);
				// Return the old token as fallback
				return credentials.idToken;
			}
			
			console.log("[ApiClient] Successfully refreshed credentials");
			
			// Log new token expiration
			const decoded = decodeJWT(newCredentials.idToken);
			if (decoded?.exp) {
				const expiresAt = new Date(decoded.exp * 1000);
				const now = new Date();
				const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / 1000 / 60;
				console.log(`[ApiClient] New ID token expires in ${minutesUntilExpiry.toFixed(2)} minutes`);
			}
			
			return newCredentials.idToken;
		}

		// Token is still valid, log remaining time
		const decoded = decodeJWT(credentials.idToken);
		if (decoded?.exp) {
			const expiresAt = new Date(decoded.exp * 1000);
			const now = new Date();
			const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / 1000 / 60;
			console.log(`[ApiClient] ID token expires in ${minutesUntilExpiry.toFixed(2)} minutes`);
		}

		return credentials.idToken;
	} catch (error) {
		console.error("[ApiClient] Error getting auth token:", error);
		return null;
	}
}

interface ApiRequestOptions extends RequestInit {
	requiresAuth?: boolean;
	sessionClient?: SessionClient | null;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
	endpoint: string,
	options: ApiRequestOptions = {},
): Promise<T> {
	const { requiresAuth = true, sessionClient, ...fetchOptions } = options;

	const headers = new Headers(fetchOptions.headers);
	headers.set("Content-Type", "application/json");

	// Add authentication token if required
	if (requiresAuth) {
		const token = await getAuthToken(sessionClient || null);
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		} else {
			throw new ApiError(
				"Authentication required. Please log in.",
				401,
				"No access token available"
			);
		}
	}

	const url = `${API_BASE_URL}${endpoint}`;

	try {
		const response = await fetch(url, {
			...fetchOptions,
			headers,
		});

		// Handle non-OK responses
		if (!response.ok) {
			let errorMessage = `Request failed: ${response.status}`;
			let errorDetails: string | undefined;

			try {
				const errorData = await response.json();
				errorMessage = errorData.error || errorMessage;
				errorDetails = errorData.details;
			} catch {
				// If JSON parsing fails, use status text
				errorMessage = response.statusText || errorMessage;
			}

			throw new ApiError(errorMessage, response.status, errorDetails);
		}

		// Parse and return JSON response
		const data = await response.json();
		return data as T;
	} catch (error) {
		// Re-throw ApiError as-is
		if (error instanceof ApiError) {
			throw error;
		}

		// Wrap other errors
		if (error instanceof Error) {
			throw new ApiError(
				error.message,
				0, // 0 indicates network error
				"Network error or server unavailable",
			);
		}

		throw new ApiError("Unknown error occurred", 0);
	}
}

/**
 * Validate an invite code and get circle details
 * This endpoint is PUBLIC - does not require authentication
 * 
 * @param inviteCode - The UUID invite code to validate
 * @returns Invite and circle details
 */
export async function validateInviteCode(inviteCode: string) {
	const url = `/invites/validate?code=${encodeURIComponent(inviteCode)}`;

	try {
		const response = await fetch(`${API_BASE_URL}${url}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			let errorMessage = `Request failed: ${response.status}`;
			let errorDetails: string | undefined;

			try {
				const errorData = await response.json();
				errorMessage = errorData.error || errorMessage;
				errorDetails = errorData.details;
			} catch {
				errorMessage = response.statusText || errorMessage;
			}

			throw new ApiError(errorMessage, response.status, errorDetails);
		}

		return await response.json();
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}

		if (error instanceof Error) {
			throw new ApiError(
				error.message,
				0,
				"Network error or server unavailable",
			);
		}

		throw new ApiError("Unknown error occurred", 0);
	}
}

/**
 * Mark an invite as accepted after successful group join
 * Requires authentication
 * 
 * @param params - Invite code and transaction hash
 * @param sessionClient - Lens session client for authentication
 * @returns Acceptance confirmation
 */
export async function markInviteAccepted(params: {
	inviteCode: string;
	txHash: string;
	sessionClient: SessionClient;
}) {
	const { inviteCode, txHash, sessionClient } = params;

	const headers = new Headers({
		"Content-Type": "application/json",
	});

	// Add authentication token
	const token = await getAuthToken(sessionClient);
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	} else {
		throw new ApiError(
			"Authentication required",
			401,
			"No access token available"
		);
	}

	const response = await fetch(`${API_BASE_URL}/invites/mark-accepted`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			inviteCode,
			txHash,
		}),
	});

	if (!response.ok) {
		let errorMessage = `Request failed: ${response.status}`;
		let errorDetails: string | undefined;

		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
			errorDetails = errorData.details;
		} catch {
			errorMessage = response.statusText || errorMessage;
		}

		throw new ApiError(errorMessage, response.status, errorDetails);
	}

	return await response.json();
}

/**
 * Fund the authenticated user's wallet with CBTC and CUSD from the backend faucet
 * Requires authentication - uses the wallet address from JWT token
 * 
 * @param sessionClient - Lens session client for authentication
 * @returns Transaction details for both CBTC and CUSD transfers
 */
export async function fundWallet(
	sessionClient: SessionClient
) {
	return await apiRequest<{
		success: boolean;
		cbtcTransactionHash: string;
		cusdTransactionHash: string;
		recipientAddress: string;
		cbtcAmount: string;
		cusdAmount: string;
	}>("/onramp/fund", {
		method: "POST",
		requiresAuth: true,
		sessionClient,
		body: JSON.stringify({}),
	});
}
