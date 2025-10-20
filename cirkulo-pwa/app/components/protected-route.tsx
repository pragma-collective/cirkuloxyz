import * as React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "app/context/auth-context";
import { Loader2 } from "lucide-react";

/**
 * ProtectedRoute Component
 *
 * Wrapper for routes that require authentication.
 * - Checks if user has Dynamic wallet connected
 * - Checks if user has Lens account
 * - Redirects to /login if not authenticated
 * - Shows loading state while checking authentication
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

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

  // Redirect to login if not authenticated (no wallet connected)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected route
  return <Outlet />;
}
