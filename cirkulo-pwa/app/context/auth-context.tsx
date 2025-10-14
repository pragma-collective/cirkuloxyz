import * as React from "react";

// User interface
export interface User {
  id: string;
  hasProfile: boolean;
  name?: string;
  lensUsername?: string;
  bio?: string;
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
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Mock login function - simulates social/email login
  const login = React.useCallback(async (): Promise<User> => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock user without profile
    const mockUser: User = {
      id: "mock-user-123",
      hasProfile: false,
    };

    setUser(mockUser);
    setIsLoading(false);

    return mockUser;
  }, []);

  // Mock create profile function
  const createProfile = React.useCallback(async (data: ProfileData): Promise<void> => {
    setIsLoading(true);

    // Simulate profile creation delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update user with profile data
    setUser((currentUser) => {
      if (!currentUser) return null;

      return {
        ...currentUser,
        hasProfile: true,
        name: data.name,
        lensUsername: data.lensUsername,
        bio: data.bio,
      };
    });

    setIsLoading(false);
  }, []);

  // Logout function
  const logout = React.useCallback(() => {
    setUser(null);
    setIsLoading(false);
  }, []);

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
