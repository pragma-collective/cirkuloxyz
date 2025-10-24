import { Navigate, Outlet } from "react-router";
import { useAuth } from "app/context/auth-context";
import { Loader2 } from "lucide-react";

/**
 * Authenticated Route Guard
 *
 * Protects routes that require FULL authentication (wallet + Lens session).
 * Used for main app routes like dashboard, explore, create-circle, etc.
 *
 * ## Guard Logic
 *
 * 1. **Loading State**: Show spinner while auth state is being determined
 *    - Wallet connecting
 *    - Lens accounts loading
 *
 * 2. **No Wallet**: Redirect to /login if wallet not connected
 *
 * 3. **Wallet but No Lens Session**: Show loading while AuthContext navigates
 *    - AuthContext will redirect to /onboarding (no accounts)
 *    - AuthContext will redirect to /select-account (multiple accounts)
 *    - AuthContext will authenticate automatically (single account)
 *
 * 4. **Fully Authenticated**: Render protected route
 *    - User has wallet connected
 *    - User has active Lens session
 *
 * @see app/components/auth-flow-guard.tsx for onboarding/select-account guard
 * @see app/context/auth-context.tsx for auth state management
 */
export default function AuthenticatedRoute() {
	const { user, isLoading, hasLensSession } = useAuth();

	console.log("[AuthenticatedRoute] Render:", {
		isLoading,
		hasUser: !!user,
		hasSession: hasLensSession,
		pathname: window.location.pathname,
	});

	// Show loading state while checking authentication
	// This includes wallet connection, Lens account fetching, and session resume
	// During initial load, isLoading will be true until everything resolves
	if (isLoading) {
		console.log("[AuthenticatedRoute] Showing loading spinner");
		return (
			<div className="min-h-screen flex items-center justify-center bg-neutral-50">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="size-12 text-primary-600 animate-spin" />
					<p className="text-sm text-neutral-600">Loading...</p>
				</div>
			</div>
		);
	}

	// If no user (wallet not connected), redirect to login
	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// User has wallet but no Lens session yet
	// AuthContext navigation hook will handle routing to onboarding or select-account
	// This should only happen after loading is complete
	if (!hasLensSession) {
		// Instead of showing another loading state, let the navigation hook redirect
		// This prevents the white page during navigation
		return null;
	}

	// User is fully authenticated (wallet + Lens session)
	// Render the protected route
	return <Outlet />;
}
