import { useState } from "react";
import type { Route } from "./+types/select-account";
import { useNavigate } from "react-router";
import { XershaLogo } from "app/components/xersha-logo";
import { useAuth } from "app/context/auth-context";
import { AccountCard } from "app/components/account-selection/AccountCard";
import { AccountCardSkeleton } from "app/components/account-selection/AccountCardSkeleton";
import { EmptyState } from "app/components/account-selection/EmptyState";
import { LoadingState } from "app/components/account-selection/LoadingState";
import type { LensAccount } from "app/hooks/fetch-lens-accounts";
import { cn } from "app/lib/utils";
import { AlertCircle } from "lucide-react";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Select Your Account - Xersha" },
		{
			name: "description",
			content: "Choose which Lens account you want to use with Xersha",
		},
	];
}

export default function SelectAccount() {
	const navigate = useNavigate();
	const { user, selectAccount } = useAuth();
	const [isSelecting, setIsSelecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const lensAccounts = user?.lensAccounts || [];
	const isLoading = !user;

	const handleSelectAccount = async (account: LensAccount) => {
		setIsSelecting(true);
		setError(null); // Clear previous errors

		try {
			// Authenticate with Lens as account owner
			const result = await selectAccount(account);

			if (!result.success) {
				// Authentication failed
				console.error("[SelectAccount] Authentication failed:", result.error);
				setError(result.error || "Failed to authenticate with selected account");
				setIsSelecting(false);
				return;
			}

			// Authentication succeeded - navigate to dashboard
			setTimeout(() => {
				navigate("/dashboard", { replace: true });
			}, 300); // Small delay for smooth transition
		} catch (err) {
			console.error("[SelectAccount] Error selecting account:", err);
			setError(
				err instanceof Error
					? err.message
					: "An unexpected error occurred. Please try again.",
			);
			setIsSelecting(false);
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
				{/* Decorative background blobs */}
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
					<div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
					<div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
					<div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
				</div>

				{/* Main content */}
				<div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
					<div className="w-full max-w-4xl space-y-6">
						{/* Logo */}
						<div className="flex flex-col items-center space-y-2 mb-8">
							<XershaLogo size="md" />
						</div>

						<LoadingState />
					</div>
				</div>
			</div>
		);
	}

	// Empty state (no accounts)
	if (lensAccounts.length === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
				{/* Decorative background blobs */}
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
					<div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
					<div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
					<div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
				</div>

				{/* Main content */}
				<div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
					<div className="w-full max-w-4xl space-y-6">
						{/* Logo */}
						<div className="flex flex-col items-center space-y-2 mb-8">
							<XershaLogo size="md" />
						</div>

						<EmptyState />
					</div>
				</div>
			</div>
		);
	}

	// Show featured card for single account, grid for multiple
	const isSingleAccount = lensAccounts.length === 1;

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
			{/* Decorative background blobs */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
				<div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
				<div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
			</div>

			{/* Main content */}
			<div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
				<div className="w-full max-w-4xl space-y-6">
					{/* Logo */}
					<div className="flex flex-col items-center space-y-2 mb-8">
						<XershaLogo size="md" />
					</div>

					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
							{isSingleAccount
								? "Welcome Back!"
								: "Select Your Account"}
						</h1>
						<p className="text-lg text-neutral-600">
							{isSingleAccount
								? "Continue with your Lens account"
								: `You have ${lensAccounts.length} Lens accounts. Choose which one to use.`}
						</p>
					</div>

					{/* Error Banner */}
					{error && (
						<div className="mb-6 p-4 bg-error-50 border-2 border-error-200 rounded-xl flex items-start gap-3 max-w-2xl mx-auto">
							<AlertCircle className="size-5 text-error-600 shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium text-error-700">
									Authentication Failed
								</p>
								<p className="text-sm text-error-600 mt-1">{error}</p>
							</div>
						</div>
					)}

					{/* Account Cards */}
					{isSingleAccount ? (
						// Featured card for single account
						<div className="max-w-lg mx-auto">
							<AccountCard
								account={lensAccounts[0]}
								variant="featured"
								onSelect={handleSelectAccount}
								isSelecting={isSelecting}
							/>
						</div>
					) : (
						// Grid for multiple accounts
						<div
							className={cn(
								"grid gap-4",
								"grid-cols-1",
								"md:grid-cols-2",
								lensAccounts.length > 4 && "lg:grid-cols-3",
							)}
						>
							{lensAccounts.map((account) => (
								<AccountCard
									key={account.address}
									account={account}
									variant="compact"
									onSelect={handleSelectAccount}
									isSelecting={isSelecting}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
