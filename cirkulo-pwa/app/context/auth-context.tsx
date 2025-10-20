import * as React from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { lensClient } from "app/lib/lens";
import { authEvents } from "app/lib/auth-events";

// Lens account interface
export interface LensAccount {
	address: string;
	username: string;
	metadata?: {
		name?: string;
		bio?: string;
		picture?: string;
	};
}

// User interface
export interface User {
	id: string;
	hasProfile: boolean;
	name?: string;
	lensUsername?: string;
	bio?: string;
	walletAddress?: string;
	lensAccount?: LensAccount;
	hasLensAccount: boolean;
}

// Profile data for creation
export interface ProfileData {
	name: string;
	lensUsername: string;
	bio?: string;
	picture?: string; // lens:// URI from Lens Storage
}

// Auth context type
export interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: () => Promise<User>;
	createProfile: (data: ProfileData) => Promise<void>;
	logout: () => void;
}

// Create context with undefined default
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const {
		user: dynamicUser,
		primaryWallet,
		setShowAuthFlow,
		handleLogOut,
	} = useDynamicContext();

	// Check if user is authenticated (has a user and wallet)
	const isAuthenticated = Boolean(dynamicUser && primaryWallet);

	const [profileData, setProfileData] = React.useState<{
		hasProfile: boolean;
		name?: string;
		lensUsername?: string;
		bio?: string;
	}>({ hasProfile: false });
	const [lensAccount, setLensAccount] = React.useState<LensAccount | undefined>(
		undefined,
	);
	const [isCheckingLens, setIsCheckingLens] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	// Store pending login promise resolver
	const loginResolverRef = React.useRef<((user: User) => void) | null>(null);

	// Check for Lens account when wallet address changes
	React.useEffect(() => {
		const checkLensAccount = async () => {
			if (!primaryWallet?.address) return;

			setIsCheckingLens(true);
			try {
				const result = await fetchAccountsAvailable(lensClient, {
					managedBy: evmAddress(primaryWallet.address),
					includeOwned: true,
				});

				if (result.isOk() && result.value.items.length > 0) {
					const accountManaged = result.value.items[0];
					const account = accountManaged.account;
					setLensAccount({
						address: account.address,
						username: account.username?.localName || account.address,
						metadata: account.metadata
							? {
									name: account.metadata.name || undefined,
									bio: account.metadata.bio || undefined,
									picture: account.metadata.picture || undefined,
								}
							: undefined,
					});
				} else {
					setLensAccount(undefined);
				}
			} catch (error) {
				console.error("Error checking Lens account:", error);
				setLensAccount(undefined);
			} finally {
				setIsCheckingLens(false);
			}
		};

		checkLensAccount();
	}, [primaryWallet?.address]);

	// Map Dynamic user to our User interface
	const user: User | null = React.useMemo(() => {
		if (!isAuthenticated || !dynamicUser) return null;

		return {
			id: dynamicUser.userId || primaryWallet?.address || "unknown",
			walletAddress: primaryWallet?.address,
			hasProfile: profileData.hasProfile,
			name: profileData.name || lensAccount?.metadata?.name,
			lensUsername: profileData.lensUsername || lensAccount?.username,
			bio: profileData.bio || lensAccount?.metadata?.bio,
			lensAccount,
			hasLensAccount: Boolean(lensAccount),
		};
	}, [isAuthenticated, dynamicUser, primaryWallet, profileData, lensAccount]);

	// When user becomes available, resolve pending login promise
	React.useEffect(() => {
		if (user && loginResolverRef.current && !isCheckingLens) {
			loginResolverRef.current(user);
			loginResolverRef.current = null;
			setIsLoading(false);
		}
	}, [user, isCheckingLens]);

	// Login function - triggers Dynamic auth flow and returns user when ready
	const login = React.useCallback(async (): Promise<User> => {
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

	// Create profile function
	const createProfile = React.useCallback(
		async (data: ProfileData): Promise<void> => {
			setIsLoading(true);

			// TODO: Implement actual Lens account creation using @lens-protocol/metadata
			// Example:
			// import { account } from "@lens-protocol/metadata";
			// const metadata = account({
			//   name: data.name,
			//   bio: data.bio,
			//   picture: data.picture, // lens:// URI
			// });

			console.log("[Auth] Creating profile with data:", {
				name: data.name,
				lensUsername: data.lensUsername,
				bio: data.bio,
				picture: data.picture,
			});

			// Simulate profile creation delay (2 seconds)
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Update profile data
			setProfileData({
				hasProfile: true,
				name: data.name,
				lensUsername: data.lensUsername,
				bio: data.bio,
			});

			setIsLoading(false);
		},
		[],
	);

	// Logout function
	const logout = React.useCallback(() => {
		handleLogOut();
		setProfileData({ hasProfile: false });
		setIsLoading(false);
	}, [handleLogOut]);

	const value = React.useMemo(
		() => ({
			user,
			isLoading,
			login,
			createProfile,
			logout,
		}),
		[user, isLoading, login, createProfile, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
	const context = React.useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
