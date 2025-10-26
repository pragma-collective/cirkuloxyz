/**
 * Hook for joining public Lens Protocol groups (no invite code required)
 * Handles blockchain transaction and pool membership sync
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinGroup } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import type { SessionClient, TxHash } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { addMemberToPool } from "./use-add-member-to-pool";
import { toast } from "~/lib/toast";

/**
 * Parameters for joining a public group
 */
export interface JoinPublicGroupParams {
	groupAddress: string;
	sessionClient: SessionClient;
	walletClient: any; // WalletClient from Dynamic/viem
	memberAddress: string; // User's wallet address for pool sync
}

/**
 * Result from joining a public group
 */
export interface JoinPublicGroupResult {
	groupAddress: string;
	txHash: string;
}

/**
 * Hook for joining a public Lens Protocol group
 *
 * Flow:
 * 1. Call Lens Protocol's joinGroup (no invite code needed)
 * 2. Handle blockchain transaction via wallet
 * 3. Wait for transaction confirmation
 * 4. Sync member to pool contract via backend API
 * 5. Invalidate relevant queries
 *
 * Features:
 * - Direct join for public circles (no invite code)
 * - Blockchain transaction handling
 * - Automatic pool membership sync
 * - Query cache invalidation
 * - Toast notifications
 * - Comprehensive error handling
 *
 * @example
 * ```tsx
 * const { mutateAsync: joinPublicGroup, isPending } = useJoinPublicGroup();
 *
 * try {
 *   const result = await joinPublicGroup({
 *     groupAddress: "0x123...",
 *     sessionClient,
 *     walletClient,
 *     memberAddress: "0xabc...",
 *   });
 *
 *   navigate(`/circle/${result.groupAddress}`);
 * } catch (error) {
 *   toast.error(error.message);
 * }
 * ```
 */
export function useJoinPublicGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: JoinPublicGroupParams): Promise<JoinPublicGroupResult> => {
			const { groupAddress, sessionClient, walletClient, memberAddress } = params;

			console.log("[useJoinPublicGroup] Joining public group:", groupAddress);

			// Step 1: Join Lens Group (no invite code or rules needed for public groups)
			const joinResult = await joinGroup(sessionClient, {
				group: evmAddress(groupAddress),
			})
				.andThen(handleOperationWith(walletClient))
				.andThen(sessionClient.waitForTransaction);

			if (joinResult.isErr()) {
				console.error("[useJoinPublicGroup] Join failed:", joinResult.error);
				const errorMessage =
					(joinResult.error as any)?.message || "Failed to join circle";
				throw new Error(errorMessage);
			}

			const txHash = joinResult.value as TxHash;
			console.log("[useJoinPublicGroup] Successfully joined Lens Group, tx:", txHash);

			// Step 2: Sync pool membership (cross-chain sync via backend)
			try {
				const poolSyncResult = await addMemberToPool(
					{
						groupAddress,
						memberAddress,
					},
					sessionClient,
				);

				console.log(
					`[useJoinPublicGroup] ✅ Pool sync successful. Tx: ${poolSyncResult.txHash}`,
				);
			} catch (poolError) {
				// Log pool sync error but don't block user flow
				// User is already in Lens Group, pool membership is secondary
				console.error(
					"[useJoinPublicGroup] ⚠️ Pool sync failed (non-critical):",
					poolError,
				);
				// Show a toast notification that pool sync failed
				// but user can still access the circle via Lens Group
				toast.warning(
					"Joined circle successfully, but pool sync failed. You may need to refresh.",
				);
			}

			return {
				groupAddress,
				txHash: txHash as string,
			};
		},

		onSuccess: (data) => {
			console.log("[useJoinPublicGroup] Join successful, invalidating queries");

			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ["groups"] });
			queryClient.invalidateQueries({ queryKey: ["group", data.groupAddress] });
			queryClient.invalidateQueries({ queryKey: ["my-circles"] });

			toast.success("Successfully joined the circle!");
		},

		onError: (error: Error) => {
			console.error("[useJoinPublicGroup] Error:", error);

			// Parse error message for user-friendly display
			let errorMessage = error.message || "Failed to join circle";

			// Check for common error patterns
			if (errorMessage.includes("already a member")) {
				errorMessage = "You are already a member of this circle";
			} else if (errorMessage.includes("user rejected")) {
				errorMessage = "Transaction was rejected";
			}

			toast.error(errorMessage);
		},

		retry: false,
	});
}
