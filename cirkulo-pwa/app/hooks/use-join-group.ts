/**
 * Hook for joining a Lens Protocol group with an invite code
 * Handles blockchain transaction and backend notification
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinGroup, fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress, blockchainData } from "@lens-protocol/client";
import type { SessionClient, TxHash } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { markInviteAccepted } from "~/lib/api-client";
import { toast } from "~/lib/toast";

/**
 * Parameters for joining a group
 */
export interface JoinGroupParams {
	groupAddress: string;
	inviteCode: string;
	sessionClient: SessionClient;
	walletClient: any; // WalletClient from Dynamic/viem
}

/**
 * Result from joining a group
 */
export interface JoinGroupResult {
	groupAddress: string;
	txHash: string;
}

/**
 * Hook for joining a Lens Protocol group with an invite code
 * 
 * Flow:
 * 1. Call Lens Protocol's joinGroup with invite code in ruleParams
 * 2. Handle blockchain transaction via wallet
 * 3. Wait for transaction confirmation
 * 4. Mark invite as accepted in backend (non-blocking)
 * 5. Invalidate relevant queries
 * 
 * Features:
 * - Blockchain transaction handling
 * - Automatic backend notification
 * - Query cache invalidation
 * - Toast notifications
 * - Comprehensive error handling
 * 
 * @example
 * ```tsx
 * const { mutateAsync: joinGroup, isPending } = useJoinGroup();
 * 
 * try {
 *   const result = await joinGroup({
 *     groupAddress: "0x123...",
 *     inviteCode: "abc-123",
 *     sessionClient,
 *     walletClient,
 *   });
 *   
 *   navigate(`/circle/${result.groupAddress}`);
 * } catch (error) {
 *   toast.error(error.message);
 * }
 * ```
 */
export function useJoinGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: JoinGroupParams): Promise<JoinGroupResult> => {
			const { groupAddress, inviteCode, sessionClient, walletClient } = params;

			console.log("[useJoinGroup] Joining group with invite:", {
				groupAddress,
				inviteCode: inviteCode.substring(0, 8) + "...",
			});

			// Fetch the group to get the actual RuleId
			console.log("[useJoinGroup] Fetching group to get RuleId:", groupAddress);
			
			const groupResult = await fetchGroup(sessionClient, {
				group: evmAddress(groupAddress),
			});

			if (groupResult.isErr()) {
				throw new Error(`Failed to fetch group: ${groupResult.error.message}`);
			}

			const group = groupResult.value;
			
			if (!group) {
				throw new Error("Group not found");
			}
			
			console.log("[useJoinGroup] Group fetched successfully");

			// Get rule contract address from environment
			const ruleContractAddress = import.meta.env
				.VITE_LENS_INVITE_RULE_CONTRACT_ADDRESS;

			if (!ruleContractAddress) {
				throw new Error(
					"VITE_LENS_INVITE_RULE_CONTRACT_ADDRESS not configured",
				);
			}

			console.log("[useJoinGroup] Looking for rule:", ruleContractAddress);

			// Find the invite rule in the group's required rules
			// The rule ID is already properly formatted by Lens Protocol
			const inviteRule = group.rules.required.find(
				(rule) => rule.address.toLowerCase() === ruleContractAddress.toLowerCase()
			);

			if (!inviteRule) {
				throw new Error("Invite rule not found in group configuration");
			}

			const ruleId = inviteRule.id;
			console.log("[useJoinGroup] Found RuleId from group:", ruleId);

			// Encode the invite code as a string parameter
			// The contract expects the RAW invite code string (not hashed)
			// It will hash it internally: keccak256(abi.encodePacked(inviteCode))
			const inviteCodeEncoded = encodeAbiParameters(
				parseAbiParameters("string"),
				[inviteCode],
			);

			console.log("[useJoinGroup] Invite code (ABI encoded):", inviteCodeEncoded);

			// Step 1: Join group on-chain via Lens Protocol
			// The raw invite code is passed to our InviteOnlyGroupRule contract
			// using rulesProcessingParams with unknownRule structure
			const joinResult = await joinGroup(sessionClient, {
				group: evmAddress(groupAddress),
				rulesProcessingParams: [
					{
						unknownRule: {
							id: ruleId, // RuleId from group configuration
							params: [
								{
									raw: {
										// keccak256("lens.param.inviteCode") - parameter key
										key: blockchainData(
											"0x5797e5205a2d50babd9c0c4d9ab1fc2eb654e110118c575a0c6efc620e7e055e",
										),
										// ABI-encoded invite code string (not hashed - contract does that)
										data: blockchainData(inviteCodeEncoded),
									},
								},
							],
						},
					},
				],
			})
				.andThen(handleOperationWith(walletClient))
				.andThen(sessionClient.waitForTransaction);

			if (joinResult.isErr()) {
				console.error("[useJoinGroup] Join failed:", joinResult.error);
				const errorMessage =
					(joinResult.error as any)?.message || "Failed to join group";
				throw new Error(errorMessage);
			}

			const txHash = joinResult.value as TxHash;
			console.log("[useJoinGroup] Successfully joined group, tx:", txHash);

			// Step 2: Mark invite as accepted in backend (non-blocking)
			// If this fails, it's okay - user is already a member on-chain
			try {
				await markInviteAccepted({
					inviteCode,
					txHash: txHash as string,
					sessionClient,
				});
				console.log("[useJoinGroup] Marked invite as accepted in backend");
			} catch (error) {
				// Don't fail the mutation - user is already a member on-chain
				console.error(
					"[useJoinGroup] Failed to mark invite as accepted (non-critical):",
					error,
				);
			}

			return {
				groupAddress,
				txHash: txHash as string,
			};
		},

		onSuccess: (data) => {
			console.log("[useJoinGroup] Join successful, invalidating queries");

			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ["groups"] });
			queryClient.invalidateQueries({ queryKey: ["group", data.groupAddress] });
			queryClient.invalidateQueries({ queryKey: ["my-circles"] });

			toast.success("Successfully joined the circle!");
		},

		onError: (error: Error) => {
			console.error("[useJoinGroup] Error:", error);

			// Parse error message for user-friendly display
			let errorMessage = error.message || "Failed to join circle";

			// Check for common error patterns
			if (errorMessage.includes("InviteNotFound")) {
				errorMessage = "This invite code is invalid or has been cancelled";
			} else if (errorMessage.includes("InviteAlreadyUsed")) {
				errorMessage = "This invite has already been used";
			} else if (errorMessage.includes("InviteExpired")) {
				errorMessage = "This invite has expired";
			} else if (errorMessage.includes("user rejected")) {
				errorMessage = "Transaction was rejected";
			}

			toast.error(errorMessage);
		},

		retry: false,
	});
}
