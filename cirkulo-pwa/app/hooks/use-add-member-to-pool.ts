/**
 * TanStack Query hook for syncing pool membership after Lens Group join
 * Follows the async logic pattern documented in CLAUDE.md
 */

import { useMutation } from "@tanstack/react-query";
import type { SessionClient } from "@lens-protocol/client";
import { apiRequest, ApiError } from "~/lib/api-client";
import { useAuth } from "~/context/auth-context";

/**
 * Request payload for adding a member to pool
 */
export interface AddMemberToPoolRequest {
	groupAddress: string;
	memberAddress: string;
}

/**
 * Response from the add member to pool API
 * Based on the API schema from cirkulo-api
 */
export interface AddMemberToPoolResponse {
	poolAddress: string;
	circleType: "contribution" | "rotating" | "fundraising";
	txHash: string;
	memberAddress: string;
}

/**
 * Add member to pool contract after Lens Group join
 * Syncs pool membership with Lens Group membership via backend
 *
 * @param request - Group address and member address to sync
 * @param sessionClient - Lens session client for authentication
 * @returns Pool sync confirmation with transaction hash
 */
export async function addMemberToPool(
	request: AddMemberToPoolRequest,
	sessionClient: SessionClient | null,
): Promise<AddMemberToPoolResponse> {
	return apiRequest<AddMemberToPoolResponse>("/invites/add-to-pool", {
		method: "POST",
		body: JSON.stringify(request),
		requiresAuth: true,
		sessionClient,
	});
}

/**
 * Hook for syncing pool membership with TanStack Query
 * Provides mutation state and automatic retry logic
 * Uses sessionClient from AuthContext
 *
 * @example
 * ```tsx
 * const { mutateAsync, isPending, error } = useAddMemberToPool();
 *
 * try {
 *   const result = await mutateAsync({
 *     groupAddress: "0x...",
 *     memberAddress: "0x...",
 *   });
 *   console.log("Pool sync successful:", result.txHash);
 * } catch (error) {
 *   // Error already has retry logic applied
 * }
 * ```
 */
export function useAddMemberToPool() {
	const { sessionClient } = useAuth();

	return useMutation({
		mutationFn: (request: AddMemberToPoolRequest) =>
			addMemberToPool(request, sessionClient),
		retry: (failureCount, error) => {
			// Don't retry client errors (4xx)
			// These are non-retryable: member already invited, circle not found, pool not deployed
			if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
				return false;
			}
			// Retry network errors and 5xx (blockchain transaction issues) up to 2 times
			return failureCount < 2;
		},
	});
}
