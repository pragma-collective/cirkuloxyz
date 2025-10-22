/**
 * TanStack Query mutation hook for canceling circle invitations
 * Handles blockchain cancellation and database updates with optimistic UI
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SessionClient } from "@lens-protocol/client";
import { apiRequest, ApiError } from "~/lib/api-client";
import { useAuth } from "~/context/auth-context";

/**
 * API response when canceling an invite
 */
export interface CancelInviteResponse {
	inviteId: string;
}

/**
 * Cancel invite API request
 */
async function cancelInvite(
	inviteId: string,
	sessionClient: SessionClient | null,
): Promise<CancelInviteResponse> {
	return apiRequest<CancelInviteResponse>(
		`/invites/${encodeURIComponent(inviteId)}/cancel`,
		{
			method: "POST",
			requiresAuth: true,
			sessionClient,
		},
	);
}

/**
 * Hook for canceling a circle invitation with TanStack Query mutation
 * Provides optimistic updates, automatic cache invalidation, and error handling
 * 
 * Features:
 * - Optimistic UI updates (immediate feedback)
 * - Automatic rollback on error
 * - Cache invalidation after success
 * - Loading and error states
 * - Retry logic for network errors
 * 
 * @param groupAddress - The group address to invalidate invites for after cancellation
 * 
 * @example
 * ```tsx
 * const { mutate: cancelInvite, isPending } = useCancelInvite(circleId);
 * 
 * const handleCancel = (inviteId: string) => {
 *   cancelInvite(inviteId, {
 *     onSuccess: () => toast.success("Invite cancelled"),
 *     onError: (error) => toast.error(error.message),
 *   });
 * };
 * ```
 */
export function useCancelInvite(groupAddress: string | undefined) {
	const { sessionClient } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (inviteId: string) => {
			if (!sessionClient) {
				throw new ApiError(
					"Authentication required",
					401,
					"No active session found"
				);
			}
			return cancelInvite(inviteId, sessionClient);
		},

		// Optimistic update - immediately update UI before API response
		onMutate: async (inviteId) => {
			// Cancel any outgoing refetches to avoid overwriting optimistic update
			await queryClient.cancelQueries({
				queryKey: ["invites", groupAddress],
			});

			// Snapshot the previous value for rollback
			const previousInvites = queryClient.getQueryData([
				"invites",
				groupAddress,
			]);

			// Optimistically update the cache
			queryClient.setQueryData(
				["invites", groupAddress],
				(old: any[] | undefined) => {
					if (!old) return old;
					
					// Filter out the cancelled invite
					return old.filter((invite) => invite.id !== inviteId);
				}
			);

			// Return context with snapshot for rollback
			return { previousInvites };
		},

		// Rollback on error
		onError: (error, inviteId, context) => {
			console.error("[useCancelInvite] Error canceling invite:", error);
			
			// Rollback to previous state
			if (context?.previousInvites) {
				queryClient.setQueryData(
					["invites", groupAddress],
					context.previousInvites
				);
			}
		},

		// Refetch after success to ensure data is in sync
		onSuccess: (data, inviteId) => {
			console.log(`[useCancelInvite] Successfully cancelled invite ${inviteId}`);
			
			// Invalidate and refetch invites to get latest state from server
			queryClient.invalidateQueries({
				queryKey: ["invites", groupAddress],
			});
		},

		// Retry configuration
		retry: (failureCount, error) => {
			// Don't retry client errors (4xx) except for rate limits
			if (error instanceof ApiError) {
				// Retry rate limits
				if (error.status === 429) {
					return failureCount < 3;
				}
				// Don't retry other client errors
				if (error.status >= 400 && error.status < 500) {
					return false;
				}
			}
			
			// Retry network errors and 5xx up to 2 times
			return failureCount < 2;
		},
	});
}
