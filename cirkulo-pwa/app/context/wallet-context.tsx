/**
 * Wallet Context
 *
 * Manages Dynamic.xyz wallet connection state.
 * Extracted from AuthContext for single responsibility.
 *
 * Provides:
 * - Wallet connection state (wallet, user, isConnected)
 * - Wallet actions (connect, disconnect)
 * - Loading states
 *
 * @see auth-layout.tsx for Dynamic SDK event handling
 * @see app/lib/session-storage.ts for session metadata management
 */

import {
	createContext,
	useContext,
	useMemo,
	useCallback,
	useState,
	useRef,
	useEffect,
	type ReactNode,
} from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { authEvents } from "app/lib/auth-events";

/**
 * Dynamic wallet user information
 */
export interface WalletUser {
	userId: string;
	email?: string;
	username?: string | null;
}

/**
 * Wallet context interface
 */
export interface WalletContextType {
	/** Connected wallet address (null if not connected) */
	walletAddress: string | null;
	/** Dynamic user information (null if not authenticated) */
	user: WalletUser | null;
	/** Whether wallet is connected and authenticated */
	isConnected: boolean;
	/** Whether wallet connection is in progress */
	isLoading: boolean;
	/**
	 * Connect wallet (shows Dynamic auth modal)
	 * Resolves when wallet is connected and authenticated
	 */
	connect: () => Promise<{ walletAddress: string; user: WalletUser }>;
	/** Disconnect wallet and clear session */
	disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Wallet Provider Component
 *
 * Must be wrapped in DynamicContextProvider (see auth-layout.tsx)
 */
export function WalletProvider({ children }: { children: ReactNode }) {
	const {
		user: dynamicUser,
		primaryWallet,
		setShowAuthFlow,
		handleLogOut,
		sdkHasLoaded,
	} = useDynamicContext();

	const [isLoading, setIsLoading] = useState(false);

	// Store pending connect promise resolver
	const connectResolverRef = useRef<
		((value: { walletAddress: string; user: WalletUser }) => void) | null
	>(null);
	const connectRejecterRef = useRef<((error: Error) => void) | null>(null);

	// Check if user is authenticated (has both user and wallet)
	const isConnected = Boolean(dynamicUser && primaryWallet);

	// Extract wallet address first (used in multiple places)
	// Store as string for stability to prevent re-renders from object reference changes
	const walletAddress: string | null = primaryWallet?.address || null;

	// Map Dynamic user to our WalletUser interface
	// Memoize based on actual VALUES, not object reference to prevent unnecessary re-renders
	const user: WalletUser | null = useMemo(() => {
		if (!dynamicUser) return null;

		return {
			userId: dynamicUser.userId || "unknown",
			email: dynamicUser.email,
			username: dynamicUser.username,
		};
	}, [dynamicUser?.userId, dynamicUser?.email, dynamicUser?.username]);

	// Log Dynamic SDK initialization state
	useEffect(() => {
		console.log("[WalletContext] Dynamic SDK state:", {
			sdkHasLoaded,
			hasUser: !!dynamicUser,
			hasWallet: !!primaryWallet,
			isConnected,
		});
	}, [sdkHasLoaded, dynamicUser, primaryWallet, isConnected]);

	// Listen for auth success events to resolve pending connect promises
	useEffect(() => {
		const handleAuthSuccess = () => {
			if (connectResolverRef.current && walletAddress && user) {
				console.log("[WalletContext] Auth success, resolving connect promise");
				connectResolverRef.current({ walletAddress, user });
				connectResolverRef.current = null;
				connectRejecterRef.current = null;
				setIsLoading(false);
			}
		};

		authEvents.on("authSuccess", handleAuthSuccess);

		return () => {
			authEvents.off("authSuccess", handleAuthSuccess);
		};
	}, [walletAddress, user]);

	// Listen for logout events to reject pending connect promises
	useEffect(() => {
		const handleLogout = () => {
			if (connectRejecterRef.current) {
				console.log("[WalletContext] Logout event, rejecting connect promise");
				connectRejecterRef.current(new Error("Authentication cancelled"));
				connectResolverRef.current = null;
				connectRejecterRef.current = null;
				setIsLoading(false);
			}
		};

		authEvents.on("logout", handleLogout);

		return () => {
			authEvents.off("logout", handleLogout);
		};
	}, []);

	/**
	 * Connect wallet using Dynamic
	 *
	 * Shows Dynamic auth modal and waits for authentication to complete.
	 * Promise resolves when wallet is connected and authenticated.
	 * Promise rejects if user cancels or authentication fails.
	 *
	 * @throws {Error} If authentication is cancelled or fails
	 */
	const connect = useCallback(async (): Promise<{
		walletAddress: string;
		user: WalletUser;
	}> => {
		// If already connected, return immediately
		if (isConnected && walletAddress && user) {
			return { walletAddress, user };
		}

		// If already loading, return existing promise
		if (isLoading && connectResolverRef.current) {
			return new Promise((resolve, reject) => {
				connectResolverRef.current = resolve;
				connectRejecterRef.current = reject;
			});
		}

		setIsLoading(true);

		// Show Dynamic auth modal
		setShowAuthFlow(true);

		// Return promise that resolves when auth succeeds
		return new Promise((resolve, reject) => {
			connectResolverRef.current = resolve;
			connectRejecterRef.current = reject;

			// Set timeout to prevent hanging promises (2 minutes)
			setTimeout(() => {
				if (connectRejecterRef.current) {
					console.warn(
						"[WalletContext] Connect timeout after 2 minutes",
					);
					connectRejecterRef.current(
						new Error("Authentication timeout"),
					);
					connectResolverRef.current = null;
					connectRejecterRef.current = null;
					setIsLoading(false);
				}
			}, 120000);
		});
	}, [setShowAuthFlow]);

	/**
	 * Disconnect wallet
	 *
	 * Logs out of Dynamic session and clears wallet state.
	 * Note: This only handles Dynamic logout. Lens logout is handled in LensContext.
	 */
	const disconnect = useCallback(async () => {
		console.log("[WalletContext] Disconnecting wallet");

		// Clear any pending promises
		if (connectRejecterRef.current) {
			connectRejecterRef.current(new Error("Disconnected"));
			connectResolverRef.current = null;
			connectRejecterRef.current = null;
		}

		// Call Dynamic logout (triggers authEvents.emit("logout"))
		await handleLogOut();

		setIsLoading(false);
	}, [handleLogOut]);

	// Combined loading state: manual connect loading OR SDK initialization loading
	// SDK must finish loading before we can determine true connection state
	const combinedIsLoading = isLoading || !sdkHasLoaded;

	const value = useMemo(
		() => ({
			walletAddress,
			user,
			isConnected,
			isLoading: combinedIsLoading,
			connect,
			disconnect,
		}),
		// Only re-create context value when wallet STATE changes, not when callbacks change
		// Callbacks are stable enough and don't need to trigger re-renders
		[walletAddress, user, isConnected, combinedIsLoading],
	);

	return (
		<WalletContext.Provider value={value}>{children}</WalletContext.Provider>
	);
}

/**
 * Hook to access wallet context
 *
 * Must be used within WalletProvider
 *
 * @throws {Error} If used outside WalletProvider
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { walletAddress, isConnected, connect, disconnect } = useWallet();
 *
 *   if (!isConnected) {
 *     return <button onClick={connect}>Connect Wallet</button>;
 *   }
 *
 *   return <div>Connected: {walletAddress}</div>;
 * }
 * ```
 */
export function useWallet() {
	const context = useContext(WalletContext);

	if (context === undefined) {
		throw new Error("useWallet must be used within a WalletProvider");
	}

	return context;
}
