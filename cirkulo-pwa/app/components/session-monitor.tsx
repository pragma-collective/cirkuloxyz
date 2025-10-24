/**
 * Session Monitor Component
 *
 * Background component that monitors authentication session health.
 * Runs periodic checks to detect session expiration and desynchronization.
 *
 * Features:
 * - Periodic session health checks (every 5 minutes)
 * - Detects wallet/Lens session desynchronization
 * - Shows warning toasts when session expiring soon
 * - Triggers coordinated logout on desync
 *
 * @see app/context/wallet-context.tsx for wallet session management
 * @see app/context/lens-context.tsx for Lens session management
 * @see app/lib/session-storage.ts for session metadata
 */

import { useEffect, useRef } from "react";
import { useWallet } from "app/context/wallet-context";
import { useLensSession } from "app/context/lens-context";
import { useAuth } from "app/context/auth-context";
import {
	getSessionMetadata,
	getSessionTimeRemaining,
	isSessionExpired,
} from "app/lib/session-storage";
import { toast } from "app/lib/toast";

/**
 * Session health check interval (5 minutes)
 */
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000;

/**
 * Warning threshold (10 minutes before expiration)
 */
const WARNING_THRESHOLD = 10 * 60 * 1000;

/**
 * Session Monitor Component
 *
 * Renders nothing (no UI), just runs background checks.
 * Must be mounted inside AuthProvider to access auth state.
 */
export function SessionMonitor() {
	const wallet = useWallet();
	const lens = useLensSession();
	const { logout } = useAuth();

	// Track if we've already shown warning to avoid spam
	const hasShownWarningRef = useRef(false);

	// Track if this is the first mount to avoid unnecessary initial checks
	const isFirstMountRef = useRef(true);

	/**
	 * Check session health and handle issues
	 */
	const checkSessionHealth = useRef(async () => {
		// Only check if wallet is connected
		if (!wallet.isConnected) {
			return;
		}

		// Get session metadata
		const metadata = getSessionMetadata();

		// Check for desynchronization: wallet connected but no Lens session
		if (!lens.sessionClient && metadata) {
			console.warn(
				"[SessionMonitor] Desync detected: Wallet connected but Lens session missing",
			);

			// If metadata exists but no session client, Lens session likely expired
			// Check if metadata is expired
			if (isSessionExpired()) {
				console.warn(
					"[SessionMonitor] Lens session expired, triggering logout",
				);
				toast.error("Session expired. Please sign in again.");
				await logout();
				return;
			}
		}

		// Check session expiration time
		const timeRemaining = getSessionTimeRemaining();

		if (timeRemaining === null) {
			// No session metadata
			return;
		}

		// If session expiring soon (< 10 minutes), show warning
		if (timeRemaining < WARNING_THRESHOLD && !hasShownWarningRef.current) {
			const minutesRemaining = Math.floor(timeRemaining / 60000);
			console.warn(
				`[SessionMonitor] Session expiring in ${minutesRemaining} minutes`,
			);

			toast.warning(
				`Session expiring in ${minutesRemaining} minutes. Please save your work.`,
				{ duration: 5000 },
			);

			hasShownWarningRef.current = true;
		}

		// If session is expired, trigger logout
		if (timeRemaining <= 0) {
			console.warn("[SessionMonitor] Session expired, triggering logout");

			toast.error("Session expired. Please sign in again.");

			await logout();
		}
	});

	/**
	 * Run periodic health checks
	 */
	useEffect(() => {
		// Only run initial check on first mount when we have a session
		if (isFirstMountRef.current && lens.sessionClient) {
			checkSessionHealth.current();
			isFirstMountRef.current = false;
		}

		// Set up interval for periodic checks
		const intervalId = setInterval(() => {
			checkSessionHealth.current();
		}, HEALTH_CHECK_INTERVAL);

		console.log(
			"[SessionMonitor] Started session monitoring (check every 5 minutes)",
		);

		// Cleanup on unmount
		return () => {
			clearInterval(intervalId);
			console.log("[SessionMonitor] Stopped session monitoring");
		};
	}, [lens.sessionClient]);

	/**
	 * Reset warning flag when session changes
	 * (e.g., user re-authenticates)
	 */
	useEffect(() => {
		if (lens.sessionClient) {
			hasShownWarningRef.current = false;
		}
	}, [lens.sessionClient]);

	// Render nothing - this is a background component
	return null;
}
