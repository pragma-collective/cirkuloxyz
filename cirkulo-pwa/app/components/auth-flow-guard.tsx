import { Navigate, Outlet } from "react-router";
import { useAuth } from "app/context/auth-context";
import { Loader2 } from "lucide-react";

/**
 * Auth Flow Guard
 *
 * Protects routes that are part of the authentication flow.
 * Used for onboarding and account selection routes.
 *
 * ## Guard Logic
 *
 * 1. **Loading State**: Show spinner while auth state is being determined
 *    - Wallet connecting
 *    - Lens accounts loading
 *
 * 2. **No Wallet**: Redirect to /login if wallet not connected
 *    - User shouldn't be on auth flow routes without wallet
 *
 * 3. **Fully Authenticated**: Redirect to /dashboard
 *    - User already has wallet + Lens session
 *    - No need to be on onboarding or account selection
 *
 * 4. **Wallet Without Lens Session**: Render auth flow route
 *    - User has wallet but needs to create/select Lens account
 *    - This is the correct state for onboarding/select-account routes
 *
 * ## Routes Protected
 * - `/onboarding` - Create new Lens account
 * - `/select-account` - Choose from multiple Lens accounts
 *
 * @see app/components/authenticated-route.tsx for main app route guard
 * @see app/context/auth-context.tsx for auth state management
 */
export default function AuthFlowGuard() {
	const { user, isLoading, hasLensSession } = useAuth();

	// Show loading state while checking authentication
	if (isLoading) {
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
	// User shouldn't be on auth flow routes without wallet
	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// User is fully authenticated (wallet + Lens session)
	// Redirect to dashboard - no need to be on auth flow routes
	if (hasLensSession) {
		return <Navigate to="/dashboard" replace />;
	}

	// User has wallet but no Lens session
	// This is the correct state for auth flow routes
	// Render onboarding or select-account page
	return <Outlet />;
}
