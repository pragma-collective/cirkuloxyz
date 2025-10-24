/**
 * Lens Context
 *
 * Manages Lens Protocol session state and account management.
 * Extracted from AuthContext for single responsibility.
 *
 * Provides:
 * - Lens account discovery (fetch accounts for wallet)
 * - Session management (create, resume, logout)
 * - Account selection (for users with multiple accounts)
 * - Session metadata tracking (expiration, timestamps)
 *
 * @see app/lib/lens.ts for Lens client setup and session documentation
 * @see app/lib/session-storage.ts for session metadata management
 */

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	useRef,
	useCallback,
	type ReactNode,
} from "react";
import type { SessionClient } from "@lens-protocol/client";
import { lensClient } from "app/lib/lens";
import { authEvents } from "app/lib/auth-events";
import {
	useFetchLensAccounts,
	type LensAccount,
} from "app/hooks/fetch-lens-accounts";
import { authenticateAsAccountOwner } from "app/hooks/authenticate-account";
import {
	setSessionMetadata,
	getSessionMetadata,
	clearSessionMetadata,
	isSessionExpired,
	isSessionWalletValid,
} from "app/lib/session-storage";

// Re-export LensAccount type for convenience
export type { LensAccount };

/**
 * Lens context interface
 */
export interface LensContextType {
	/** Lens session client (null if not authenticated) */
	sessionClient: SessionClient | null;
	/** All Lens accounts owned by the current wallet */
	accounts: LensAccount[];
	/** Currently selected/authenticated account */
	selectedAccount: LensAccount | undefined;
	/** Whether Lens accounts are being fetched */
	isLoadingAccounts: boolean;
	/** Whether Lens session is being resumed from storage */
	isResumingSession: boolean;
	/** Error from account fetching (if any) */
	accountsError: Error | null;
	/** Whether user has at least one Lens account */
	hasAccounts: boolean;
	/**
	 * Authenticate with a specific Lens account
	 * Creates new session and stores metadata
	 */
	authenticate: (
		account: LensAccount,
		walletAddress: string,
		appAddress: string,
		walletClient: any,
	) => Promise<{ success: boolean; error?: string }>;
	/** Logout from Lens session */
	logout: () => Promise<void>;
}

const LensContext = createContext<LensContextType | undefined>(undefined);

/**
 * Lens Provider Component
 *
 * Manages Lens Protocol session state.
 * Requires wallet address to fetch accounts.
 *
 * @param walletAddress - Current connected wallet address (from WalletContext)
 */
export function LensProvider({
	children,
	walletAddress,
}: {
	children: ReactNode;
	walletAddress: string | undefined;
}) {
	// Lens session state
	const [sessionClient, setSessionClient] = useState<SessionClient | null>(
		null,
	);

	// Track selected/authenticated account
	const [selectedAccount, setSelectedAccount] = useState<
		LensAccount | undefined
	>(undefined);

	// Track if this is the first mount vs a re-render
	// This prevents re-initialization during navigation
	const isMountedRef = useRef(false);

	// Track session resume loading state
	// Initialize to true if we have session metadata to check
	// This prevents navigation from running before session resume is attempted
	const [isResumingSession, setIsResumingSession] = useState(() => {
		// Only check if wallet is connected AND metadata exists
		if (walletAddress) {
			const metadata = getSessionMetadata();
			// If we have valid metadata for this wallet, we'll attempt to resume
			const shouldResume =
				metadata !== null && isSessionWalletValid(walletAddress);
			if (shouldResume) {
				console.log("[LensProvider] Initialized with session to resume");
			}
			return shouldResume;
		}
		return false;
	});

	// Fetch all Lens accounts for the connected wallet
	const {
		lensAccounts: accounts,
		isLoading: isLoadingAccounts,
		error: accountsError,
	} = useFetchLensAccounts(walletAddress);

	// Derived state
	const hasAccounts = accounts.length > 0;

	// Auto-select first account if user has exactly one
	useEffect(() => {
		if (accounts.length === 1) {
			setSelectedAccount(accounts[0]);
			console.log(
				"[LensContext] Auto-selected single account:",
				accounts[0].username,
			);
		} else if (accounts.length === 0) {
			setSelectedAccount(undefined);
		}
		// Don't auto-select if multiple accounts - user must choose
	}, [accounts]);

	/**
	 * Resume Lens session from localStorage
	 *
	 * Attempts to restore session on mount if:
	 * 1. Wallet is connected
	 * 2. Session metadata exists and is valid
	 * 3. Session wallet matches current wallet
	 * 4. Session is not expired
	 */
	useEffect(() => {
		// Track if we've already mounted to prevent re-initialization during navigation
		if (isMountedRef.current) {
			console.log(
				"[LensContext] Already mounted, skipping session resume check",
			);
			return;
		}
		isMountedRef.current = true;

		// Only attempt to resume if wallet is connected
		if (!walletAddress) {
			console.log("[LensContext] Skipping session resume: No wallet connected");
			// Clear any resuming state if wallet disconnected
			setIsResumingSession(false);
			return;
		}

		const resumeSession = async () => {
			try {
				// Check session metadata before attempting resume
				const metadata = getSessionMetadata();

				if (!metadata) {
					console.log(
						"[LensContext] No session metadata found, skipping resume",
					);
					// No session to resume, clear loading state if it was set
					setIsResumingSession(false);
					return;
				}

				// Validate session wallet matches current wallet
				if (!isSessionWalletValid(walletAddress)) {
					console.warn(
						"[LensContext] Session wallet mismatch, clearing session",
					);
					clearSessionMetadata();
					// No valid session to resume, clear loading state
					setIsResumingSession(false);
					return;
				}

				// Check if session is expired (with 5-minute buffer)
				if (isSessionExpired(5 * 60 * 1000)) {
					console.warn("[LensContext] Session expired, clearing metadata");
					clearSessionMetadata();
					// Session expired, clear loading state
					setIsResumingSession(false);
					return;
				}

				console.log("[LensContext] Attempting to resume Lens session...");

				// Note: isResumingSession is already true if we got here with valid metadata
				// (set during state initialization)

				// Attempt to resume Lens session
				const resumed = await lensClient.resumeSession();

				if (resumed.isOk()) {
					setSessionClient(resumed.value);
					console.log(
						"[LensContext] Lens session resumed successfully:",
						metadata.username || metadata.accountAddress,
					);
				} else {
					// Resume failed - clear metadata
					console.log(
						"[LensContext] Session resume failed:",
						resumed.error.message || "Unknown error",
					);
					clearSessionMetadata();

					// If we have a wallet but session resume failed, emit logout
					// This ensures wallet and Lens sessions stay synchronized
					if (walletAddress) {
						console.log(
							"[LensContext] Emitting logout due to failed session resume",
						);
						authEvents.emit("logout");
					}
				}
			} catch (err) {
				console.error(
					"[LensContext] Session resume error:",
					err instanceof Error ? err.message : "Failed to resume session",
				);
				clearSessionMetadata();
			} finally {
				// CLEAR LOADING STATE - Session resume complete (success or failure)
				setIsResumingSession(false);
			}
		};

		resumeSession();
	}, [walletAddress]);

	/**
	 * Authenticate with a specific Lens account
	 *
	 * Creates new Lens session and stores metadata.
	 * Used when user selects an account from account selection page.
	 *
	 * @param account - Lens account to authenticate with
	 * @param walletAddress - Wallet address for authentication
	 * @param appAddress - App address for authentication
	 * @param walletClient - Wallet client for signing
	 */
	const authenticate = useCallback(
		async (
			account: LensAccount,
			walletAddress: string,
			appAddress: string,
			walletClient: any,
		): Promise<{ success: boolean; error?: string }> => {
			try {
				console.log(
					"[LensContext] Authenticating as account:",
					account.address,
				);

				// Authenticate with Lens as account owner
				const authResult = await authenticateAsAccountOwner(
					account.address,
					walletAddress,
					appAddress,
					walletClient,
				);

				if (authResult.error) {
					console.error(
						"[LensContext] Authentication failed:",
						authResult.error,
					);
					return {
						success: false,
						error:
							authResult.error.message ||
							"Failed to authenticate with selected account",
					};
				}

				console.log(
					"[LensContext] Successfully authenticated as account:",
					account.address,
				);

				// Update session client
				if (authResult.sessionClient) {
					setSessionClient(authResult.sessionClient);
				}

				// Update selected account
				setSelectedAccount(account);

				// Store session metadata for expiration tracking
				setSessionMetadata(
					account.address,
					walletAddress,
					account.username,
					// TODO: Get actual session duration from Lens SDK if available
					// For now, assume 24 hours
					24 * 60 * 60 * 1000,
				);

				return { success: true };
			} catch (err) {
				console.error("[LensContext] Authenticate error:", err);
				return {
					success: false,
					error:
						err instanceof Error
							? err.message
							: "Failed to authenticate with selected account",
				};
			}
		},
		[],
	);

	/**
	 * Logout from Lens session
	 *
	 * Clears session client and metadata.
	 * Note: This does NOT log out of Dynamic wallet (handled by WalletContext).
	 */
	const logout = useCallback(async () => {
		console.log("[LensContext] Logging out from Lens session");

		// Log out of Lens session if it exists
		if (sessionClient) {
			try {
				const result = await sessionClient.logout();

				if (result.isOk()) {
					console.log("[LensContext] Lens logout successful");
				} else {
					console.error("[LensContext] Lens logout failed:", result.error);
				}
			} catch (err) {
				console.error(
					"[LensContext] Lens logout error:",
					err instanceof Error ? err.message : "Unknown error",
				);
			}
		}

		// Clear session state
		setSessionClient(null);
		setSelectedAccount(undefined);

		// Clear session metadata
		clearSessionMetadata();

		console.log("[LensContext] Lens session cleared");
	}, [sessionClient]);

	// Listen for logout events from WalletContext
	// When wallet logs out, we should clear Lens session too
	useEffect(() => {
		const handleLogout = () => {
			console.log("[LensContext] Logout event received, clearing session");
			logout();
		};

		authEvents.on("logout", handleLogout);

		return () => {
			authEvents.off("logout", handleLogout);
		};
	}, [logout]);

	// Memoize the accounts reference to prevent unnecessary re-renders
	// Use a ref to cache the joined addresses string for comparison
	const accountsKeyRef = useRef<string>("");
	const stableAccounts = useMemo(() => {
		// Create a key from account addresses for comparison
		const newKey = accounts.map((a) => a.address).join(",");

		// Only update if the key actually changed
		if (accountsKeyRef.current !== newKey) {
			accountsKeyRef.current = newKey;
			return accounts;
		}

		// Return the previous accounts array if nothing changed
		return accounts;
	}, [accounts]);

	const value = useMemo(
		() => ({
			sessionClient,
			accounts: stableAccounts,
			selectedAccount,
			isLoadingAccounts,
			isResumingSession,
			accountsError,
			hasAccounts,
			authenticate,
			logout,
		}),
		// Only re-create context value when Lens STATE changes, not when callbacks change
		// Callbacks are stable via useCallback and don't need to be in dependencies
		[
			sessionClient,
			stableAccounts,
			selectedAccount,
			isLoadingAccounts,
			isResumingSession,
			accountsError,
			hasAccounts,
		],
	);

	return <LensContext.Provider value={value}>{children}</LensContext.Provider>;
}

/**
 * Hook to access Lens context
 *
 * Must be used within LensProvider
 *
 * @throws {Error} If used outside LensProvider
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { sessionClient, accounts, authenticate } = useLensSession();
 *
 *   if (accounts.length === 0) {
 *     return <div>Create a Lens account to continue</div>;
 *   }
 *
 *   if (!sessionClient) {
 *     return <button onClick={() => authenticate(accounts[0])}>
 *       Login with {accounts[0].username}
 *     </button>;
 *   }
 *
 *   return <div>Authenticated as {accounts[0].username}</div>;
 * }
 * ```
 */
export function useLensSession() {
	const context = useContext(LensContext);

	if (context === undefined) {
		throw new Error("useLensSession must be used within a LensProvider");
	}

	return context;
}
