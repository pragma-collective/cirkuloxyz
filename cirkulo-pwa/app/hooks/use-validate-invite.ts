/**
 * TanStack Query hook for validating invite codes
 * Fetches invite and circle details from the public validation endpoint
 */

import { useQuery } from "@tanstack/react-query";
import { validateInviteCode } from "~/lib/api-client";

/**
 * Validated invite data structure from API
 */
export interface ValidatedInvite {
	code: string;
	groupAddress: string;
	circleName: string;
	circleDescription?: string;
	inviterName: string;
	memberCount?: number;
	createdAt?: string;
	expiresAt: string;
	status: "pending" | "accepted" | "expired" | "cancelled";
}

/**
 * Hook for validating an invite code
 * Does not require authentication - public endpoint
 * 
 * Features:
 * - Validates invite code exists and is valid
 * - Returns circle and inviter details
 * - Checks invite status (pending, accepted, expired, cancelled)
 * - No retry on 404 (invalid codes)
 * - 5 minute cache for valid invites
 * 
 * @param inviteCode - The invite code to validate (UUID string)
 * 
 * @example
 * ```tsx
 * const { data: invite, isLoading, error } = useValidateInvite(inviteCode);
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * if (invite.status !== "pending") return <InviteNotAvailable />;
 * 
 * return <InviteDetails invite={invite} />;
 * ```
 */
export function useValidateInvite(inviteCode: string | null) {
	return useQuery({
		queryKey: ["validate-invite", inviteCode],
		queryFn: async () => {
			if (!inviteCode) {
				throw new Error("No invite code provided");
			}

			console.log("[useValidateInvite] Validating code:", inviteCode);

			const result = await validateInviteCode(inviteCode);
			
			console.log("[useValidateInvite] Validation result:", {
				status: result.status,
				circleName: result.circleName,
			});

			return result as ValidatedInvite;
		},
		enabled: !!inviteCode, // Only run query if invite code exists
		retry: false, // Don't retry failed validations (invalid codes stay invalid)
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes after last use
	});
}
