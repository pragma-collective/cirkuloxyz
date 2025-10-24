/**
 * Auth Context
 *
 * Orchestrates authentication state by combining WalletContext and LensContext.
 * Provides a unified authentication interface to the application.
 *
 * This context does NOT manage wallet or Lens sessions directly.
 * It delegates to WalletContext and LensContext respectively.
 *
 * @see app/context/wallet-context.tsx for Dynamic wallet management
 * @see app/context/lens-context.tsx for Lens Protocol session management
 */

import {
	createContext,
	useContext,
	useMemo,
	useCallback,
	useEffect,
	type ReactNode,
} from "react";
import { getWalletClient } from "wagmi/actions";
import { wagmiConfig } from "app/lib/wagmi";
import { useWallet } from "app/context/wallet-context";
import { useLensSession, type LensAccount } from "app/context/lens-context";
import { useAuthNavigation } from "app/hooks/use-auth-navigation";

// Re-export LensAccount for backward compatibility
export type { LensAccount };

/**
 * Unified user interface combining wallet and Lens data
 */
export interface User {
	id: string;
	name?: string;
	lensUsername?: string;
	bio?: string;
	walletAddress?: string;
	lensAccount?: LensAccount;
	lensAccounts: LensAccount[];
	hasLensAccount: boolean;
}

/**
 * Auth context interface
 */
export interface AuthContextType {
	/** Unified user object (null if not authenticated) */
	user: User | null;
	/** Whether authentication is in progress */
	isLoading: boolean;
	/** Whether user has an active Lens session */
	hasLensSession: boolean;
	/** Lens session client (for API calls requiring authentication) */
	sessionClient: any | null;
	/** Login with wallet (shows Dynamic modal) */
	login: () => Promise<User>;
	/** Logout from both wallet and Lens */
	logout: () => Promise<void>;
	/** Select Lens account (for users with multiple accounts) */
	selectAccount: (
		account: LensAccount,
	) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 *
 * Combines WalletProvider and LensProvider to provide unified auth state.
 * Must be nested inside both WalletProvider and LensProvider.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const wallet = useWallet();
	const lens = useLensSession();

	// Combined loading state
	// Includes wallet loading, account loading, and session resume
	const isLoading =
		wallet.isLoading || lens.isLoadingAccounts || lens.isResumingSession;

	// Auth is fully resolved when loading is complete AND either:
	// - No wallet connected (nothing more to load)
	// - Accounts have been fetched (even if empty array)
	// This prevents navigation from running with accountCount: 0 while accounts are still loading
	const hasResolvedInitialAuth = !isLoading && (
		!wallet.isConnected || // No wallet = resolved
		lens.hasAccountsFetched // Account fetch complete (even if empty) = resolved
	);

	// Debug: Log when session client changes
	useEffect(() => {
		console.log("[AuthContext] Session client changed:", {
			hasSessionClient: !!lens.sessionClient,
			isLoading,
			hasResolvedInitialAuth,
		});
	}, [lens.sessionClient, isLoading, hasResolvedInitialAuth]);

	// Auto-navigate based on auth state
	// Only navigates after initial auth resolution to prevent premature redirects
	useAuthNavigation(
		wallet.isConnected,
		lens.accounts.length,
		!!lens.sessionClient,
		isLoading,
		hasResolvedInitialAuth,
	);

	// Simple memoization for user object to prevent recreation
	// Only depends on actual auth state values
	const user: User | null = useMemo(() => {
		if (!wallet.isConnected || !wallet.walletAddress) {
			return null;
		}

		return {
			id: wallet.user?.userId || wallet.walletAddress || "",
			walletAddress: wallet.walletAddress,
			name: lens.selectedAccount?.metadata?.name,
			lensUsername: lens.selectedAccount?.username,
			bio: lens.selectedAccount?.metadata?.bio,
			lensAccount: lens.selectedAccount,
			lensAccounts: lens.accounts,
			hasLensAccount: lens.hasAccounts,
		};
	}, [
		wallet.isConnected,
		wallet.walletAddress,
		wallet.user?.userId,
		lens.selectedAccount,
		lens.accounts,
		lens.hasAccounts,
	]);

	/**
	 * Login with wallet
	 *
	 * Shows Dynamic wallet connection modal and waits for authentication.
	 * After wallet connection, user is routed based on Lens account status.
	 */
	const login = useCallback(async (): Promise<User> => {
		console.log("[AuthContext] Starting login flow");

		// Connect wallet via WalletContext
		const { walletAddress, user: walletUser } =
			await wallet.connect();

		console.log(
			"[AuthContext] Wallet connected:",
			walletAddress,
		);

		// Return minimal user object - lens accounts will be populated after
		// This is fine since the UI will update when context changes
		return {
			id: walletUser.userId || walletAddress,
			walletAddress: walletAddress,
			lensAccounts: [],  // Will be populated after fetch
			hasLensAccount: false,  // Will be updated after fetch
		};
	}, [wallet.connect]);

	/**
	 * Logout from both wallet and Lens
	 *
	 * Clears both Dynamic wallet session and Lens Protocol session.
	 */
	const logout = useCallback(async () => {
		console.log("[AuthContext] Starting logout");

		// Logout from Lens first (if session exists)
		await lens.logout();

		// Then logout from wallet (this will emit logout event)
		await wallet.disconnect();

		console.log("[AuthContext] Logout complete");
	}, [lens.logout, wallet.disconnect]);

	/**
	 * Select Lens account
	 *
	 * Authenticates with the selected account and creates Lens session.
	 * Used when user has multiple Lens accounts.
	 */
	const selectAccount = useCallback(
		async (
			account: LensAccount,
		): Promise<{ success: boolean; error?: string }> => {
			if (!wallet.walletAddress) {
				console.error("[AuthContext] Cannot select account: No wallet connected");
				return {
					success: false,
					error: "No wallet connected. Please try logging in again.",
				};
			}

			// Get app address from environment
			const appAddress = import.meta.env.VITE_LENS_APP_ADDRESS;
			if (!appAddress) {
				console.error(
					"[AuthContext] Cannot select account: VITE_LENS_APP_ADDRESS not configured",
				);
				return {
					success: false,
					error: "App configuration error. Please contact support.",
				};
			}

			try {
				console.log(
					"[AuthContext] Selecting account:",
					account.username || account.address,
				);

				// Get wallet client on-demand from wagmi
				const walletClient = await getWalletClient(wagmiConfig);

				if (!walletClient) {
					console.error("[AuthContext] Wagmi wallet client not available");
					return {
						success: false,
						error: "Wallet client not ready. Please try again.",
					};
				}

				// Authenticate via LensContext
				const result = await lens.authenticate(
					account,
					wallet.walletAddress,
					appAddress,
					walletClient,
				);

				if (result.success) {
					console.log("[AuthContext] Account selected successfully");
				}

				return result;
			} catch (err) {
				console.error("[AuthContext] Select account error:", err);
				return {
					success: false,
					error:
						err instanceof Error
							? err.message
							: "Failed to select account",
				};
			}
		},
		[wallet.walletAddress, lens.authenticate],
	);

	// Memoize context value to prevent unnecessary re-renders
	// Only recreate when actual state changes, not callbacks
	const value = useMemo(
		() => ({
			user,
			isLoading,
			hasLensSession: !!lens.sessionClient,
			sessionClient: lens.sessionClient,
			login,
			logout,
			selectAccount,
		}),
		[user, isLoading, lens.sessionClient]
		// Callbacks are stable, no need to include them
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 *
 * Must be used within AuthProvider
 *
 * @throws {Error} If used outside AuthProvider
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { user, login, logout } = useAuth();
 *
 *   if (!user) {
 *     return <button onClick={login}>Sign In</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome {user.lensUsername || user.walletAddress}</p>
 *       <button onClick={logout}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
