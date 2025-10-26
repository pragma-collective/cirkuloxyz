/**
 * Invite Acceptance Landing Page
 * 
 * Handles invite code validation and acceptance flow
 * Shows invite details, circle info, and join button
 * 
 * Flow:
 * 1. Extract invite code from URL query param
 * 2. Validate invite code (show loading/error states)
 * 3. Check user authentication
 * 4. If unauthenticated: Store invite → Redirect to login
 * 5. If authenticated: Show details → Join on button click
 * 6. After join: Redirect to circle page
 */

import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "~/context/auth-context";
import { useValidateInvite } from "~/hooks/use-validate-invite";
import { useInviteFlow } from "~/hooks/use-invite-flow";
import { clearPendingInvite } from "~/lib/invite-storage";
import { toast } from "~/lib/toast";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2, Users, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Invite acceptance page component
 */
export default function InvitePage() {
	const [searchParams] = useSearchParams();
	const inviteCode = searchParams.get("code");
	const { user } = useAuth();

	const {
		data: validatedInvite,
		isLoading: isValidating,
		error: validationError,
	} = useValidateInvite(inviteCode || "");

	const {
		isProcessing,
		storePendingInviteForLogin,
		processInviteImmediately,
	} = useInviteFlow();

	// Clear pending invite when authenticated user lands on invite page
	// This prevents redirect loop if user navigates away from invite
	useEffect(() => {
		if (user && inviteCode) {
			console.log("[InvitePage] Authenticated user on invite page, clearing pending invite");
			clearPendingInvite();
		}
	}, [user, inviteCode]);

	// Auto-redirect unauthenticated users to login with stored invite
	useEffect(() => {
		if (!inviteCode) return;
		if (!validatedInvite) return;
		if (user) return; // Only for unauthenticated users
		if (validatedInvite.status !== "pending") return; // Only for valid invites

		console.log("[InvitePage] Storing invite and redirecting to login");

		// Store invite and redirect
		storePendingInviteForLogin({
			code: validatedInvite.code,
			groupAddress: validatedInvite.groupAddress,
			circleName: validatedInvite.circleName,
			inviterName: validatedInvite.inviterName,
		});
	}, [inviteCode, validatedInvite, user, storePendingInviteForLogin]);

	/**
	 * Handle join button click (authenticated users only)
	 */
	const handleJoin = async () => {
		if (!validatedInvite) return;

		try {
			await processInviteImmediately({
				code: validatedInvite.code,
				groupAddress: validatedInvite.groupAddress,
				circleName: validatedInvite.circleName,
				inviterName: validatedInvite.inviterName,
			});
			
			// Note: Pending invite already cleared when page loaded
			// Redirect happens in processInviteImmediately
		} catch (error) {
			console.error("[InvitePage] Join failed:", error);
			const errorMessage = error instanceof Error ? error.message : "Could not join circle";
			toast.error(`Join Failed: ${errorMessage}`);
		}
	};

	// Missing invite code
	if (!inviteCode) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-50 to-blue-50">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<AlertCircle className="w-6 h-6 text-red-600" />
						</div>
						<CardTitle>Invalid Invite Link</CardTitle>
						<CardDescription>
							This invite link is missing required information. Please request a new invite.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Loading - validating invite
	if (isValidating) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-50 to-blue-50">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
							<Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
						</div>
						<CardTitle>Validating Invite</CardTitle>
						<CardDescription>
							Please wait while we verify your invite...
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Error - validation failed
	if (validationError || !validatedInvite) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-50 to-blue-50">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<AlertCircle className="w-6 h-6 text-red-600" />
						</div>
						<CardTitle>Invalid Invite</CardTitle>
						<CardDescription>
							{validationError instanceof Error
								? validationError.message
								: "This invite could not be found or has expired."}
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-sm text-muted-foreground mb-4">
							Please contact the person who sent you this invite for a new one.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Expired invite
	if (validatedInvite.status === "expired") {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-50 to-blue-50">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
							<AlertCircle className="w-6 h-6 text-orange-600" />
						</div>
						<CardTitle>Invite Expired</CardTitle>
						<CardDescription>
							This invite expired {formatDistanceToNow(new Date(validatedInvite.expiresAt))} ago.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-sm text-muted-foreground mb-4">
							Please contact <strong>{validatedInvite.inviterName}</strong> for a new invite to{" "}
							<strong>{validatedInvite.circleName}</strong>.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Already accepted invite
	if (validatedInvite.status === "accepted") {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-50 to-blue-50">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
							<CheckCircle2 className="w-6 h-6 text-green-600" />
						</div>
						<CardTitle>Already a Member</CardTitle>
						<CardDescription>
							You've already joined {validatedInvite.circleName}!
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button asChild className="w-full">
							<a href={`/circle/${validatedInvite.groupAddress}`}>
								Go to Circle
							</a>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Cancelled invite
	if (validatedInvite.status === "cancelled") {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-50 to-blue-50">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<AlertCircle className="w-6 h-6 text-red-600" />
						</div>
						<CardTitle>Invite Cancelled</CardTitle>
						<CardDescription>
							This invite has been cancelled and is no longer valid.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-sm text-muted-foreground mb-4">
							Please contact <strong>{validatedInvite.inviterName}</strong> if you believe this is a mistake.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Valid invite - show details and join button (authenticated users only)
	// Unauthenticated users will be auto-redirected by useEffect above
	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-50 to-blue-50">
			<Card className="max-w-md w-full">
				<CardHeader className="text-center">
					<div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
						<Users className="w-6 h-6 text-blue-600" />
					</div>
					<CardTitle>You're Invited!</CardTitle>
					<CardDescription>
						{/* @TODO: wallet address is being return ATM */}
						<strong>{validatedInvite.inviterName.slice(0, 6)}</strong> invited you to join
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Circle Details */}
					<div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-lg p-4 space-y-2">
						<h3 className="font-semibold text-lg">{validatedInvite.circleName}</h3>
						{validatedInvite.circleDescription && (
							<p className="text-sm text-muted-foreground">
								{validatedInvite.circleDescription}
							</p>
						)}
						{validatedInvite.memberCount !== undefined && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Users className="w-4 h-4" />
								<span>{validatedInvite.memberCount} members</span>
							</div>
						)}
					</div>

					{/* Invite Details */}
					<div className="space-y-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							<span>
								Expires {formatDistanceToNow(new Date(validatedInvite.expiresAt), { addSuffix: true })}
							</span>
						</div>
					</div>

					{/* Join Button */}
					<Button
						onClick={handleJoin}
						disabled={isProcessing}
						className="w-full"
						size="lg"
					>
						{isProcessing ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Joining...
							</>
						) : (
							"Join Circle"
						)}
					</Button>

					<p className="text-xs text-center text-muted-foreground">
						By joining, you agree to the circle's rules and terms.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
