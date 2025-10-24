/**
 * Auth Navigation Hook
 *
 * Determines where user should be routed based on authentication state.
 * Extracted from AuthContext for better testability and separation of concerns.
 *
 * @see app/context/auth-context.tsx for usage
 */

import { useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

/**
 * Navigation destination result
 */
export interface NavigationDestination {
	/** Whether navigation is needed */
	shouldNavigate: boolean;
	/** Destination path (null if no navigation needed) */
	destination: string | null;
	/** Reason for navigation (for logging) */
	reason: string;
}

/**
 * Determine where user should be routed based on auth state
 *
 * Pure function for easy testing.
 *
 * @param walletConnected - Whether wallet is connected
 * @param accountCount - Number of Lens accounts
 * @param hasSession - Whether Lens session exists
 * @param currentPath - Current route path
 * @returns Navigation destination and reason
 *
 * @example
 * ```typescript
 * const result = determineAuthDestination(true, 0, false, "/dashboard");
 * if (result.shouldNavigate) {
 *   navigate(result.destination);
 * }
 * ```
 */
export function determineAuthDestination(
	walletConnected: boolean,
	accountCount: number,
	hasSession: boolean,
	currentPath: string,
): NavigationDestination {
	// If wallet not connected, user should be on login
	if (!walletConnected) {
		if (currentPath === "/login") {
			return {
				shouldNavigate: false,
				destination: null,
				reason: "Already on login page",
			};
		}
		return {
			shouldNavigate: true,
			destination: "/login",
			reason: "No wallet connected",
		};
	}

	// If already has Lens session, no need to navigate away from app routes
	if (hasSession) {
		// User is fully authenticated, they can be anywhere in the app
		return {
			shouldNavigate: false,
			destination: null,
			reason: "User has active Lens session",
		};
	}

	// Wallet connected but no Lens session - route based on account count

	// No Lens accounts → onboarding
	if (accountCount === 0) {
		if (currentPath === "/onboarding") {
			return {
				shouldNavigate: false,
				destination: null,
				reason: "Already on onboarding page",
			};
		}
		return {
			shouldNavigate: true,
			destination: "/onboarding",
			reason: "No Lens accounts, need to create one",
		};
	}

	// One Lens account → dashboard (auto-selected)
	if (accountCount === 1) {
		if (currentPath === "/dashboard") {
			return {
				shouldNavigate: false,
				destination: null,
				reason: "Already on dashboard",
			};
		}
		return {
			shouldNavigate: true,
			destination: "/dashboard",
			reason: "One Lens account, auto-selected",
		};
	}

	// Multiple Lens accounts → account selection
	if (accountCount >= 2) {
		if (currentPath === "/select-account") {
			return {
				shouldNavigate: false,
				destination: null,
				reason: "Already on account selection page",
			};
		}
		return {
			shouldNavigate: true,
			destination: "/select-account",
			reason: "Multiple Lens accounts, user must choose",
		};
	}

	// Fallback (shouldn't reach here)
	return {
		shouldNavigate: false,
		destination: null,
		reason: "Unknown state",
	};
}

/**
 * Hook to handle auth-based navigation automatically
 *
 * Watches auth state and navigates user to appropriate route.
 * Uses determineAuthDestination() internally.
 *
 * IMPORTANT: Only runs after initial auth state is fully resolved to prevent
 * premature redirects during page load/refresh.
 *
 * @param walletConnected - Whether wallet is connected
 * @param accountCount - Number of Lens accounts
 * @param hasLensSession - Whether user has an active Lens session
 * @param isLoading - Whether auth state is loading (wallet/accounts/session resume)
 * @param hasResolvedInitialAuth - Whether initial auth resolution is complete
 *
 * @example
 * ```typescript
 * function AuthProvider() {
 *   const wallet = useWallet();
 *   const lens = useLensSession();
 *   const isLoading = wallet.isLoading || lens.isLoadingAccounts || lens.isResumingSession;
 *   const hasResolvedInitialAuthRef = useRef(false);
 *
 *   useAuthNavigation(
 *     wallet.isConnected,
 *     lens.accounts.length,
 *     !!lens.sessionClient,
 *     isLoading,
 *     hasResolvedInitialAuthRef.current
 *   );
 * }
 * ```
 */
export function useAuthNavigation(
	walletConnected: boolean,
	accountCount: number,
	hasLensSession: boolean,
	isLoading: boolean,
	hasResolvedInitialAuth: boolean,
) {
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		// PERFORMANCE: Early exit for authenticated users - skip ALL logic
		// This prevents unnecessary effect execution during normal navigation
		// between authenticated routes (e.g., dashboard → profile)
		if (hasLensSession && walletConnected && hasResolvedInitialAuth) {
			console.log(
				"[AuthNavigation] Authenticated user, no navigation needed",
			);
			return;
		}

		// CRITICAL: Don't navigate until initial auth state is resolved
		// This prevents redirects during page load before session resume completes
		if (!hasResolvedInitialAuth) {
			console.log(
				"[AuthNavigation] Waiting for initial auth resolution",
				{
					isLoading,
					walletConnected,
					accountCount,
					hasLensSession,
				},
			);
			return;
		}

		// Skip navigation while auth state is loading
		// This includes wallet connection, account fetching, and session resume
		if (isLoading) {
			console.log(
				"[AuthNavigation] Skipping navigation - auth is loading",
				{
					walletConnected,
					accountCount,
					hasLensSession,
				},
			);
			return;
		}

		// Log current auth state before running navigation logic
		console.log("[AuthNavigation] Evaluating navigation with state:", {
			walletConnected,
			accountCount,
			hasLensSession,
			currentPath: location.pathname,
		});

		// Run navigation logic for unauthenticated or partially authenticated users
		const result = determineAuthDestination(
			walletConnected,
			accountCount,
			hasLensSession,
			location.pathname,
		);

		if (result.shouldNavigate && result.destination) {
			console.log(
				"[AuthNavigation] Navigating to",
				result.destination,
				"-",
				result.reason,
			);
			navigate(result.destination, { replace: true });
		} else {
			console.log("[AuthNavigation] No navigation needed -", result.reason);
		}
	}, [
		walletConnected,
		accountCount,
		hasLensSession,
		isLoading,
		hasResolvedInitialAuth,
		// NOTE: location.pathname intentionally removed to prevent effect
		// from running on every route change for authenticated users
		// NOTE: navigate intentionally removed - it's stable and doesn't
		// need to trigger this effect. This prevents unnecessary runs during navigation.
	]);
}

/**
 * Manual navigation trigger (for explicit control)
 *
 * Returns a function that can be called to manually trigger navigation
 * based on current auth state.
 *
 * Useful for post-login navigation where you want explicit control
 * instead of relying on automatic effects.
 *
 * @example
 * ```typescript
 * function LoginPage() {
 *   const wallet = useWallet();
 *   const lens = useLensSession();
 *   const navigateBasedOnAuth = useManualAuthNavigation();
 *
 *   const handleLogin = async () => {
 *     await wallet.connect();
 *     // Explicitly trigger navigation after login
 *     navigateBasedOnAuth(
 *       wallet.isConnected,
 *       lens.accounts.length,
 *       !!lens.sessionClient
 *     );
 *   };
 * }
 * ```
 */
export function useManualAuthNavigation() {
	const navigate = useNavigate();
	const location = useLocation();

	return useCallback(
		(
			walletConnected: boolean,
			accountCount: number,
			hasLensSession: boolean,
		) => {
			const result = determineAuthDestination(
				walletConnected,
				accountCount,
				hasLensSession,
				location.pathname,
			);

			if (result.shouldNavigate && result.destination) {
				console.log(
					"[AuthNavigation] Manual navigation to",
					result.destination,
					"-",
					result.reason,
				);
				navigate(result.destination, { replace: true });
			}

			return result;
		},
		[navigate, location.pathname],
	);
}
