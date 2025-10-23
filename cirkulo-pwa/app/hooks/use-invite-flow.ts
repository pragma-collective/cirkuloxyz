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
	const [hasProcessedPending, setHasProcessedPending] = useState(false);

	/**
	 * Process pending invite after user logs in
	 * Called automatically when user becomes authenticated
	 */
	const processPendingInvite = useCallback(async () => {
		// Check if user is fully authenticated
		if (!user || !sessionClient || !primaryWallet) {
			console.log("[InviteFlow] User not fully authenticated yet");
			return;
		}

		// Check if we already processed a pending invite this session
		if (hasProcessedPending) {
			console.log("[InviteFlow] Already processed pending invite this session");
			return;
		}

		// Check for pending invite
		const pendingInvite = getPendingInvite();
		if (!pendingInvite) {
			return;
		}

		console.log("[InviteFlow] Processing pending invite:", {
			code: pendingInvite.code,
			groupAddress: pendingInvite.groupAddress,
		});

		setIsProcessing(true);
		setHasProcessedPending(true); // Prevent double-processing

		try {
			// Get wallet client
			// @ts-expect-error - getWalletClient exists on Dynamic wallet at runtime
			const walletClient = await primaryWallet.getWalletClient();
			if (!walletClient) {
				throw new Error("Could not access wallet client");
			}

			// Join group
			const result = await joinGroup({
				groupAddress: pendingInvite.groupAddress,
				inviteCode: pendingInvite.code,
				sessionClient,
				walletClient,
			});

			// Clear pending invite
			clearPendingInvite();

			console.log("[InviteFlow] Successfully processed pending invite");

			// Redirect to circle page
			navigate(`/circle/${result.groupAddress}`, { replace: true });
		} catch (error) {
			console.error("[InviteFlow] Failed to process pending invite:", error);

			// Reset so user can try again
			setHasProcessedPending(false);
			setIsProcessing(false);

			// Don't clear the invite - user can retry from invite link
		}
	}, [user, sessionClient, primaryWallet, joinGroup, navigate, hasProcessedPending]);

	/**
	 * Auto-process pending invite when user becomes authenticated
	 * Runs once when all auth conditions are met
	 */
	useEffect(() => {
		if (user && sessionClient && primaryWallet && !isProcessing && !hasProcessedPending) {
			processPendingInvite();
		}
	}, [user, sessionClient, primaryWallet, isProcessing, hasProcessedPending, processPendingInvite]);

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

				// Join group
				const result = await joinGroup({
					groupAddress: invite.groupAddress,
					inviteCode: invite.code,
					sessionClient,
					walletClient,
				});

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
