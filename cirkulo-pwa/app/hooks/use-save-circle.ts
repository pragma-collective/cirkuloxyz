/**
 * TanStack Query hook for saving circle configuration to database
 */

import { useMutation } from "@tanstack/react-query";
import type { SessionClient } from "@lens-protocol/client";
import { apiRequest, ApiError } from "~/lib/api-client";
import { useAuth } from "~/context/auth-context";

/**
 * Request payload for saving a circle
 */
export interface SaveCircleRequest {
	circleName: string;
	poolAddress: string;
	lensGroupAddress: string;
	poolDeploymentTxHash: string;
	circleType: "contribution" | "rotating" | "fundraising";
	currency: "cusd" | "cbtc";
	categories?: string[]; // Optional array of categories for fundraising circles
}

/**
 * Response from the save circle API
 * Based on the API schema from cirkulo-api
 */
export interface SaveCircleResponse {
	success: boolean;
	message: string;
	data: {
		id: string;
		circleName: string;
		poolAddress: string;
		lensGroupAddress: string;
		circleType: string;
		currency: string;
		categories?: string[];
		creatorAddress: string;
		createdAt: string;
	};
}

/**
 * Save circle configuration to database after pool deployment
 */
export async function saveCircle(
	request: SaveCircleRequest,
	sessionClient: SessionClient | null,
): Promise<SaveCircleResponse> {
	return apiRequest<SaveCircleResponse>("/circles/create", {
		method: "POST",
		body: JSON.stringify(request),
		requiresAuth: true,
		sessionClient,
	});
}

/**
 * Hook for saving circle configurations with TanStack Query
 * Provides mutation state and automatic retry logic
 * Uses sessionClient from AuthContext
 */
export function useSaveCircle() {
	const { sessionClient } = useAuth();

	return useMutation({
		mutationFn: (request: SaveCircleRequest) => saveCircle(request, sessionClient),
		retry: (failureCount, error) => {
			// Don't retry client errors (4xx)
			if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
				return false;
			}
			// Retry network errors and 5xx up to 2 times
			return failureCount < 2;
		},
	});
}
