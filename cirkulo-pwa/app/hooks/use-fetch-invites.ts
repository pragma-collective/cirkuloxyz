/**
 * TanStack Query hook for fetching circle invitations
 */

import { useQuery } from "@tanstack/react-query";
import type { SessionClient } from "@lens-protocol/client";
import { apiRequest, ApiError } from "~/lib/api-client";
import { useAuth } from "~/context/auth-context";

/**
 * Invite data structure matching the API response
 */
export interface Invite {
	id: string;
	code: string;
	recipientEmail: string;
	groupAddress: string;
	senderAddress: string;
	status: "pending" | "accepted" | "expired" | "cancelled";
	expiresAt: string; // ISO 8601
	acceptedAt?: string; // ISO 8601
	registeredTxHash?: string;
	createdAt: string; // ISO 8601
	updatedAt: string; // ISO 8601
}

/**
 * Fetch invites for a specific group
 * Only the group owner can access this endpoint
 */
export async function fetchInvites(
	groupAddress: string,
	sessionClient: SessionClient | null,
): Promise<Invite[]> {
	return apiRequest<Invite[]>(
		`/invites?groupAddress=${encodeURIComponent(groupAddress)}`,
		{
			method: "GET",
			requiresAuth: true,
			sessionClient,
		},
	);
}

/**
 * Hook for fetching circle invitations with TanStack Query
 * Provides automatic caching, refetching, and loading states
 * 
 * @param groupAddress - The Ethereum address of the group/circle
 * @param enabled - Whether the query should run (defaults to true if groupAddress exists)
 */
export function useFetchInvites(groupAddress: string | undefined, enabled = true) {
	const { sessionClient } = useAuth();

	return useQuery({
		queryKey: ["invites", groupAddress],
		queryFn: () => {
			if (!groupAddress) {
				throw new Error("Group address is required");
			}
			return fetchInvites(groupAddress, sessionClient);
		},
		enabled: !!groupAddress && !!sessionClient && enabled,
		staleTime: 30000, // 30 seconds - data is considered fresh for this period
		retry: (failureCount, error) => {
			// Don't retry if forbidden (user is not owner)
			if (error instanceof ApiError && error.status === 403) {
				return false;
			}
			// Don't retry client errors (4xx)
			if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
				return false;
			}
			// Retry network errors and 5xx up to 2 times
			return failureCount < 2;
		},
	});
}
