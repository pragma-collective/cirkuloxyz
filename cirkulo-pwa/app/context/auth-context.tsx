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
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
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
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
	const {
		user: dynamicUser,
		primaryWallet,
		setShowAuthFlow,
		handleLogOut,
	} = useDynamicContext();

	// Check if user is authenticated (has a user and wallet)
	const isAuthenticated = Boolean(dynamicUser && primaryWallet);

	const [profileData, setProfileData] = useState<{
		hasProfile: boolean;
		name?: string;
		lensUsername?: string;
		bio?: string;
	}>({ hasProfile: false });
	const [isLoading, setIsLoading] = useState(false);

	// Store pending login promise resolver
	const loginResolverRef = useRef<((user: User) => void) | null>(null);

	// Fetch Lens account for the connected wallet
	const {
		lensAccount,
		isLoading: isCheckingLens,
		error: lensError,
	} = useFetchLensAccounts(primaryWallet?.address);

	// Map Dynamic user to our User interface
	const user: User | null = useMemo(() => {
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
	useEffect(() => {
		if (user && loginResolverRef.current && !isCheckingLens) {
			loginResolverRef.current(user);
			loginResolverRef.current = null;
			setIsLoading(false);
		}
	}, [user, isCheckingLens]);

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

	// Create profile function
	const createProfile = useCallback(
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
	const logout = useCallback(() => {
		handleLogOut();
		setProfileData({ hasProfile: false });
		setIsLoading(false);
	}, [handleLogOut]);

	const value = useMemo(
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
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
