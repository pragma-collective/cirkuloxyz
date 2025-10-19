import * as React from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

// User interface
export interface User {
  id: string;
  hasProfile: boolean;
  name?: string;
  lensUsername?: string;
  bio?: string;
  walletAddress?: string;
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
  const [isLoading, setIsLoading] = React.useState(false);

  // Map Dynamic user to our User interface
  const user: User | null = React.useMemo(() => {
    if (!isAuthenticated || !dynamicUser) return null;

    return {
      id: dynamicUser.userId || primaryWallet?.address || "unknown",
      walletAddress: primaryWallet?.address,
      hasProfile: profileData.hasProfile,
      name: profileData.name,
      lensUsername: profileData.lensUsername,
      bio: profileData.bio,
    };
  }, [isAuthenticated, dynamicUser, primaryWallet, profileData]);

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
