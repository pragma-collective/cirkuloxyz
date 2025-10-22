/**
 * TanStack Query hook for sending circle invitations
 */

import { useMutation } from "@tanstack/react-query";
import type { SessionClient } from "@lens-protocol/client";
import { apiRequest, ApiError } from "~/lib/api-client";
import { useAuth } from "~/context/auth-context";

/**
 * Request payload for sending an invite
 */
export interface SendInviteRequest {
	recipientEmail: string;
	groupAddress: string;
}

/**
 * Response from the send invite API
 * Based on the API schema from cirkulo-api
 */
export interface SendInviteResponse {
	inviteId: string;
	inviteCode: string;
	expiresAt: string;
}

/**
 * Send a circle invitation via API
 */
export async function sendInvite(
	request: SendInviteRequest,
	sessionClient: SessionClient | null,
): Promise<SendInviteResponse> {
	return apiRequest<SendInviteResponse>("/invites/send", {
		method: "POST",
		body: JSON.stringify(request),
		requiresAuth: true,
		sessionClient,
	});
}

/**
 * Hook for sending circle invitations with TanStack Query
 * Provides mutation state and automatic retry logic
 * Uses sessionClient from AuthContext
 */
export function useSendInvite() {
	const { sessionClient } = useAuth();

	return useMutation({
		mutationFn: (request: SendInviteRequest) => sendInvite(request, sessionClient),
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
