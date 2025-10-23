/**
 * TanStack Query hook for fetching circle configuration from database
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest, ApiError } from "~/lib/api-client";

/**
 * Response from the fetch circle API
 * Based on the API schema from cirkulo-api
 */
export interface FetchCircleResponse {
	success: boolean;
	data: {
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
	} | null;
}

/**
 * Fetch circle configuration by lens group address
 */
export async function fetchCircle(
	lensGroupAddress: string,
): Promise<FetchCircleResponse> {
	return apiRequest<FetchCircleResponse>(`/circles/${lensGroupAddress}`, {
		method: "GET",
		requiresAuth: false, // Public endpoint
	});
}

/**
 * Hook for fetching circle configuration with TanStack Query
 * No authentication required - public endpoint
 */
export function useFetchCircle(lensGroupAddress: string | undefined) {
	console.log(lensGroupAddress);
	return useQuery({
		queryKey: ["circle", lensGroupAddress],
		queryFn: () => fetchCircle(lensGroupAddress!),
		enabled: !!lensGroupAddress && lensGroupAddress.length === 42,
		retry: (failureCount, error) => {
			// Don't retry 404 errors (circle not found)
			if (error instanceof ApiError && error.status === 404) {
				return false;
			}
			// Retry network errors and 5xx up to 2 times
			return failureCount < 2;
		},
	});
}
