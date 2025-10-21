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

	const lensAccounts = user?.lensAccounts || [];
	const isLoading = !user;

	const handleSelectAccount = async (account: LensAccount) => {
		setIsSelecting(true);

		try {
			// Select the account in auth context
			selectAccount(account);

			// Navigate to dashboard
			setTimeout(() => {
				navigate("/dashboard", { replace: true });
			}, 300); // Small delay for smooth transition
		} catch (error) {
			console.error("[SelectAccount] Error selecting account:", error);
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
