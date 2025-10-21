import {
	useEffect,
	useState,
	useMemo,
	useCallback,
	useRef,
	useContext,
	createContext,
	type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { SessionClient } from "@lens-protocol/client";
import { lensClient } from "app/lib/lens";
import { authEvents } from "app/lib/auth-events";
import {
	useFetchLensAccounts,
	type LensAccount,
} from "app/hooks/fetch-lens-accounts";

// Re-export LensAccount for backward compatibility
export type { LensAccount };

// User interface
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

// Auth context type
export interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	sessionClient: SessionClient | null;
	setSessionClient: (client: SessionClient | null) => void;
	login: () => Promise<User>;
	logout: () => void;
	selectAccount: (account: LensAccount) => void;
}

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
	const {
		user: dynamicUser,
		primaryWallet,
		setShowAuthFlow,
		handleLogOut,
	} = useDynamicContext();
	const navigate = useNavigate();
	const location = useLocation();

	// Check if user is authenticated (has a user and wallet)
	const isAuthenticated = Boolean(dynamicUser && primaryWallet);

	const [isLoading, setIsLoading] = useState(false);

	// Store pending login promise resolver
	const loginResolverRef = useRef<((user: User) => void) | null>(null);

	// Lens session state
	const [sessionClient, setSessionClient] = useState<SessionClient | null>(
		null,
	);

	// Fetch all Lens accounts for the connected wallet
	const {
		lensAccounts,
		isLoading: isCheckingLens,
		error: lensError,
	} = useFetchLensAccounts(primaryWallet?.address);

	// Track selected account (defaults to first account if only one)
	const [selectedAccount, setSelectedAccount] = useState<
		LensAccount | undefined
	>(undefined);

	// Auto-select first account if user has exactly one
	useEffect(() => {
		if (lensAccounts.length === 1) {
			setSelectedAccount(lensAccounts[0]);
		} else if (lensAccounts.length === 0) {
			setSelectedAccount(undefined);
		}
		// Don't auto-select if multiple accounts - user must choose
	}, [lensAccounts]);

	// Resume Lens session from localStorage when user is authenticated
	useEffect(() => {
		// Only attempt to resume session if user is authenticated with Dynamic
		if (!isAuthenticated) {
			return;
		}

		const resumeSession = async () => {
			try {
				console.log("[AuthContext] Resuming Lens session...");
				const resumed = await lensClient.resumeSession();

				if (resumed.isOk()) {
					setSessionClient(resumed.value);
					console.log("[AuthContext] Lens session resumed successfully");
				} else {
					// Non-blocking error - user might not have Lens account yet
					console.log(
						"[AuthContext] No active Lens session:",
						resumed.error.message || "No session found",
					);
				}
			} catch (err) {
				// Non-blocking error - user might not have Lens account yet
				console.error(
					"[AuthContext] Session resume error:",
					err instanceof Error ? err.message : "Failed to resume session",
				);
			}
		};

		resumeSession();
	}, [isAuthenticated]);

	// Map Dynamic user to our User interface
	const user: User | null = useMemo(() => {
		if (!isAuthenticated || !dynamicUser) return null;

		return {
			id: dynamicUser.userId || primaryWallet?.address || "unknown",
			walletAddress: primaryWallet?.address,
			name: selectedAccount?.metadata?.name,
			lensUsername: selectedAccount?.username,
			bio: selectedAccount?.metadata?.bio,
			lensAccount: selectedAccount,
			lensAccounts,
			hasLensAccount: lensAccounts.length > 0,
		};
	}, [
		isAuthenticated,
		dynamicUser,
		primaryWallet,
		selectedAccount,
		lensAccounts,
	]);

	// When user becomes available, resolve pending login promise
	useEffect(() => {
		if (user && loginResolverRef.current && !isCheckingLens) {
			loginResolverRef.current(user);
			loginResolverRef.current = null;
			setIsLoading(false);
		}
	}, [user, isCheckingLens]);

	// Handle post-authentication navigation
	useEffect(() => {
		console.log("LENS ACCOUNT", isCheckingLens, lensAccounts, !isAuthenticated);
		if (isCheckingLens || !isAuthenticated) return;

		if (selectedAccount) return; // user already has selected account

		// Determine which page user should be on based on account count
		const shouldBeOnOnboarding = lensAccounts.length === 0;
		const shouldBeOnSelectAccount = lensAccounts.length >= 2;
		const shouldBeOnDashboard = lensAccounts.length === 1;

		console.log("shouldBeOnOnboarding", shouldBeOnOnboarding);
		// Skip if already on correct destination page
		if (
			(location.pathname === "/dashboard" && shouldBeOnDashboard) ||
			(location.pathname === "/onboarding" && shouldBeOnOnboarding) ||
			(location.pathname === "/select-account" && shouldBeOnSelectAccount)
		) {
			console.log("HERE");
			return;
		}

		// Navigate based on Lens account status
		if (lensAccounts.length === 0) {
			// No Lens accounts → redirect to onboarding
			navigate("/onboarding", { replace: true });
		} else if (lensAccounts.length === 1) {
			// One Lens account → auto-select and redirect to dashboard
			navigate("/dashboard", { replace: true });
		} else {
			// Multiple Lens accounts → redirect to account selection
			navigate("/select-account", { replace: true });
		}
	}, [user, isCheckingLens, location.pathname, navigate, lensAccounts]);

	// Handle session expiration / logout
	useEffect(() => {
		const handleLogout = () => {
			console.log(
				"[Auth] Logout event received, current path:",
				location.pathname,
			);

			navigate("/login", { replace: true });
		};

		// Listen for logout events (including session expiration)
		authEvents.on("logout", handleLogout);

		// Cleanup listener on unmount
		return () => {
			authEvents.off("logout", handleLogout);
		};
	}, [location.pathname, navigate]);

	// Login function - triggers Dynamic auth flow and returns user when ready
	const login = useCallback(async (): Promise<User> => {
		setIsLoading(true);

		// Trigger Dynamic's auth modal
		setShowAuthFlow(true);

		// Return promise that resolves when user is authenticated
		return new Promise((resolve, reject) => {
			loginResolverRef.current = resolve;

			// Listen for auth cancellation (user closes modal)
			const handleAuthCancel = () => {
				if (loginResolverRef.current) {
					loginResolverRef.current = null;
					setIsLoading(false);
					authEvents.off("authSuccess", handleAuthCancel);
					reject(new Error("Authentication cancelled"));
				}
			};

			// Note: Auth success is handled by the useEffect that watches for user
			// This ensures we wait for both Dynamic auth AND Lens account check
		});
	}, [setShowAuthFlow]);

	// Logout function
	const logout = useCallback(async () => {
		// First, log out of Lens session if it exists
		if (sessionClient) {
			try {
				console.log("[AuthContext] Logging out of Lens session...");
				const result = await sessionClient.logout();

				if (result.isOk()) {
					console.log("[AuthContext] Lens logout successful");
				} else {
					console.error("[AuthContext] Lens logout failed:", result.error);
				}
			} catch (err) {
				console.error(
					"[AuthContext] Lens logout error:",
					err instanceof Error ? err.message : "Unknown error",
				);
			}
		}

		// Then log out of Dynamic wallet session
		handleLogOut();
		setIsLoading(false);
		setSelectedAccount(undefined);
		setSessionClient(null);
	}, [handleLogOut, sessionClient]);

	// Select account function
	const selectAccount = useCallback((account: LensAccount) => {
		setSelectedAccount(account);
	}, []);

	const value = useMemo(
		() => ({
			user,
			isLoading,
			sessionClient,
			setSessionClient,
			login,
			logout,
			selectAccount,
		}),
		[
			user,
			isLoading,
			sessionClient,
			setSessionClient,
			login,
			logout,
			selectAccount,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
