/**
 * API Client for backend communication
 * Handles Lens authentication and request formatting
 */

import type { SessionClient } from "@lens-protocol/client";

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
 * Get authentication token from the provided session client
 */
function getAuthToken(sessionClient: SessionClient | null): string | null {
	if (!sessionClient) {
		console.warn("[ApiClient] No active Lens session");
		return null;
	}

	try {
		// Get credentials from Lens session
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

		return credentials.accessToken;
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
		const token = getAuthToken(sessionClient || null);
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
	const token = getAuthToken(sessionClient);
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
