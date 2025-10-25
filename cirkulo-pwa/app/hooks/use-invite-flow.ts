/**
 * Orchestrates the complete invite acceptance flow
 * Handles authentication state, pending invites, and auto-processing
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/auth-context";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useJoinGroup } from "./use-join-group";
import {
	getPendingInvite,
	clearPendingInvite,
	storePendingInvite,
	type PendingInvite,
} from "~/lib/invite-storage";
import { addMemberToPool } from "./use-add-member-to-pool";

/**
 * Hook for managing the invite acceptance flow
 * 
 * Features:
 * - Auto-processes pending invites after login
 * - Stores invites for unauthenticated users
 * - Handles immediate processing for authenticated users
 * - Manages processing state and errors
 * 
 * @example
 * ```tsx
 * const { isProcessing, storePendingInviteForLogin, processInviteImmediately } = useInviteFlow();
 * 
 * // For unauthenticated users
 * if (!user) {
 *   storePendingInviteForLogin({ code, groupAddress, circleName, inviterName });
 *   // User will be redirected to login, then auto-processed
 * }
 * 
 * // For authenticated users
 * if (user) {
 *   await processInviteImmediately({ code, groupAddress, circleName, inviterName });
 *   // User joins immediately and is redirected to circle
 * }
 * ```
 */
export function useInviteFlow() {
	const navigate = useNavigate();
	const { user, sessionClient } = useAuth();
	const { primaryWallet } = useDynamicContext();
	const { mutateAsync: joinGroup, isPending: isJoining } = useJoinGroup();

	const [isProcessing, setIsProcessing] = useState(false);

	/**
	 * NOTE: Removed auto-processing of pending invites.
	 * The auth navigation (use-auth-navigation.ts) now handles redirecting
	 * to /invite?code=... after full authentication.
	 * This gives users visibility and control over the join action.
	 */

	/**
	 * Store invite for later processing (when user needs to login)
	 * Redirects to login page with invite stored in localStorage
	 * 
	 * @param invite - Invite data to store
	 */
	const storePendingInviteForLogin = useCallback(
		(invite: Omit<PendingInvite, "timestamp">) => {
			console.log("[InviteFlow] Storing invite for post-login processing");
			storePendingInvite(invite);
			navigate("/login", { replace: true });
		},
		[navigate],
	);

	/**
	 * Immediately process invite (for authenticated users)
	 * Joins group and redirects to circle page
	 * 
	 * @param invite - Invite data to process
	 * @throws Error if user is not authenticated or join fails
	 */
	const processInviteImmediately = useCallback(
		async (invite: Omit<PendingInvite, "timestamp">) => {
      console.log(user, sessionClient, primaryWallet);
			if (!user || !sessionClient || !primaryWallet) {
				throw new Error("User not authenticated");
			}

			console.log("[InviteFlow] Processing invite immediately");
			setIsProcessing(true);

			try {
				// Get wallet client
				// @ts-expect-error - getWalletClient exists on Dynamic wallet at runtime
				const walletClient = await primaryWallet.getWalletClient();
				if (!walletClient) {
					throw new Error("Could not access wallet client");
				}

				// Step 1: Join Lens Group
				const result = await joinGroup({
					groupAddress: invite.groupAddress,
					inviteCode: invite.code,
					sessionClient,
					walletClient,
				});

				console.log("[InviteFlow] Successfully joined Lens Group");

				// Step 2: Sync pool membership (cross-chain sync via backend)
				try {
					const poolSyncResult = await addMemberToPool(
						{
							groupAddress: invite.groupAddress,
							memberAddress: primaryWallet.address,
						},
						sessionClient,
					);

					console.log(
						`[InviteFlow] ✅ Pool sync successful. Tx: ${poolSyncResult.txHash}`,
					);
				} catch (poolError) {
					// Log pool sync error but don't block user flow
					// User is already in Lens Group, pool membership is secondary
					console.error(
						"[InviteFlow] ⚠️ Pool sync failed (non-critical):",
						poolError,
					);
					// Could show a toast notification here that pool sync failed
					// but user can still access the circle via Lens Group
				}

				console.log("[InviteFlow] Successfully processed invite");

				// Redirect to circle page
				navigate(`/circle/${result.groupAddress}`, { replace: true });
			} catch (error) {
				setIsProcessing(false);
				throw error;
			}
		},
		[user, sessionClient, primaryWallet, joinGroup, navigate],
	);

	return {
		isProcessing: isProcessing || isJoining,
		storePendingInviteForLogin,
		processInviteImmediately,
	};
}
