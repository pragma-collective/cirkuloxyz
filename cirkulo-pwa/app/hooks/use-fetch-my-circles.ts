/**
 * TanStack Query hook for fetching user's circles from /circles/me endpoint
 */

import { useQuery } from "@tanstack/react-query";
import type { SessionClient } from "@lens-protocol/client";
import { apiRequest, ApiError } from "~/lib/api-client";

/**
 * Circle data from database
 */
export interface CircleData {
	id: string;
	circleName: string;
	poolAddress: string;
	lensGroupAddress: string;
	poolDeploymentTxHash: string | null;
	circleType: "contribution" | "rotating" | "fundraising";
	currency: "cusd" | "cbtc";
	creatorAddress: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Lens group data from Lens Protocol
 */
export interface LensGroupData {
	address: string;
	owner: string;
	metadata: {
		name?: string;
		description?: string;
		[key: string]: any;
	} | null;
	timestamp: number;
}

/**
 * Enriched circle with Lens group data
 */
export interface EnrichedCircle extends CircleData {
	lensGroup: LensGroupData;
}

/**
 * Response from the /circles/me API endpoint
 */
export interface FetchMyCirclesResponse {
	success: boolean;
	data: EnrichedCircle[];
}

/**
 * Fetch user's circles (requires authentication)
 */
export async function fetchMyCircles(
	sessionClient: SessionClient,
): Promise<FetchMyCirclesResponse> {
	return apiRequest<FetchMyCirclesResponse>("/circles/me", {
		method: "GET",
		requiresAuth: true,
		sessionClient,
	});
}

/**
 * Hook for fetching user's circles with TanStack Query
 * Requires authentication - JWT token from Lens session
 * 
 * @param sessionClient - Active Lens session client
 * @param enabled - Optional flag to control when the query runs
 */
export function useFetchMyCircles(
	sessionClient: SessionClient | null,
	enabled = true,
) {
	return useQuery({
		queryKey: ["circles", "me"],
		queryFn: () => {
			if (!sessionClient) {
				throw new ApiError(
					"No active session",
					401,
					"User must be authenticated to fetch circles",
				);
			}
			return fetchMyCircles(sessionClient);
		},
		enabled: enabled && !!sessionClient,
		retry: (failureCount, error) => {
			// Don't retry 401 errors (authentication issues)
			if (error instanceof ApiError && error.status === 401) {
				return false;
			}
			// Retry network errors and 5xx up to 2 times
			return failureCount < 2;
		},
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
	});
}
