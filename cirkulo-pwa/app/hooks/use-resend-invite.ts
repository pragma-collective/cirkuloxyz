/**
 * TanStack Query mutation hook for resending circle invitations
 * Triggers a new email to be sent for pending invitations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SessionClient } from "@lens-protocol/client";
import { apiRequest, ApiError } from "~/lib/api-client";
import { useAuth } from "~/context/auth-context";

/**
 * API response when resending an invite
 */
export interface ResendInviteResponse {
	inviteId: string;
	emailId?: string;
}

/**
 * Resend invite API request
 */
async function resendInvite(
	inviteId: string,
	sessionClient: SessionClient | null,
): Promise<ResendInviteResponse> {
	return apiRequest<ResendInviteResponse>(
		`/invites/${encodeURIComponent(inviteId)}/resend`,
		{
			method: "POST",
			requiresAuth: true,
			sessionClient,
		},
	);
}

/**
 * Hook for resending a circle invitation with TanStack Query mutation
 * Sends a new email for the invitation without generating a new invite code
 * 
 * Features:
 * - Loading and error states
 * - Automatic cache invalidation to update "last sent" time
 * - Retry logic for network errors
 * 
 * @param groupAddress - The group address to invalidate invites for after resending
 * 
 * @example
 * ```tsx
 * const { mutate: resendInvite, isPending } = useResendInvite(circleId);
 * 
 * const handleResend = (inviteId: string) => {
 *   resendInvite(inviteId, {
 *     onSuccess: () => toast.success("Invite resent"),
 *     onError: (error) => toast.error(error.message),
 *   });
 * };
 * ```
 */
export function useResendInvite(groupAddress: string | undefined) {
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
			return resendInvite(inviteId, sessionClient);
		},

		onSuccess: (data, inviteId) => {
			console.log(`[useResendInvite] Successfully resent invite ${inviteId}`);
			
			// Invalidate and refetch invites to update "last sent" time
			queryClient.invalidateQueries({
				queryKey: ["invites", groupAddress],
			});
		},

		onError: (error) => {
			console.error("[useResendInvite] Error resending invite:", error);
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
