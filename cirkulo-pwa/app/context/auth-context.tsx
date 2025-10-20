import * as React from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { lensClient } from "app/lib/lens";

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
  lensAccount?: LensAccount; // Lens Protocol account info
  hasLensAccount: boolean; // Quick check if user has Lens account
}

// Profile data for creation
export interface ProfileData {
  name: string;
  lensUsername: string;
  bio?: string;
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
  const [lensAccount, setLensAccount] = React.useState<LensAccount | undefined>(undefined);
  const [isCheckingLens, setIsCheckingLens] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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

  // Login function - triggers Dynamic auth flow
  // Note: Actual navigation should be handled via useEffect watching user state
  const login = React.useCallback(async (): Promise<User> => {
    setIsLoading(true);

    // Trigger Dynamic's auth modal
    setShowAuthFlow(true);

    // Return a promise that resolves when user becomes authenticated
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        reject(new Error("Authentication timeout"));
      }, 120000); // 2 minute timeout

      // This will be resolved by the useEffect watching authentication state
      const checkInterval = setInterval(() => {
        if (isAuthenticated && dynamicUser && primaryWallet) {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          setIsLoading(false);

          const newUser: User = {
            id: dynamicUser.userId || primaryWallet.address || "unknown",
            walletAddress: primaryWallet.address,
            hasProfile: profileData.hasProfile,
            name: profileData.name,
            lensUsername: profileData.lensUsername,
            bio: profileData.bio,
            lensAccount,
            hasLensAccount: Boolean(lensAccount),
          };

          resolve(newUser);
        }
      }, 500);
    });
  }, [setShowAuthFlow, isAuthenticated, dynamicUser, primaryWallet, profileData]);

  // Create profile function
  const createProfile = React.useCallback(async (data: ProfileData): Promise<void> => {
    setIsLoading(true);

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
  }, []);

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
    [user, isLoading, login, createProfile, logout]
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
