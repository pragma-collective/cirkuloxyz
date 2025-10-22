import { User, AtSign } from "lucide-react";
import { Button } from "app/components/ui/button";
import { cn } from "app/lib/utils";
import type { LensAccount } from "app/hooks/fetch-lens-accounts";

interface AccountCardProps {
	account: LensAccount;
	onSelect: (account: LensAccount) => void;
	isSelecting?: boolean;
}

export function AccountCard({
	account,
	onSelect,
	isSelecting = false,
}: AccountCardProps) {
	// Extract photo from metadata (Grove URI)
	const photoUri = account.metadata?.picture;

	return (
		<div
			className={cn(
				"bg-white/90 backdrop-blur-sm border-2 border-neutral-200 rounded-3xl p-6 transition-all duration-200",
				"hover:border-primary-500 hover:shadow-xl",
				"flex flex-col sm:flex-row sm:items-center gap-4",
			)}
		>
			{/* Profile Photo */}
			<div
				className={cn(
					"rounded-full bg-gradient-to-br from-primary-100 to-secondary-100",
					"flex items-center justify-center shrink-0",
					"size-14 sm:size-16 mx-auto sm:mx-0",
				)}
			>
				{photoUri ? (
					<img
						src={photoUri}
						alt={account.metadata?.name || account.username}
						className="size-14 sm:size-16 rounded-full object-cover"
					/>
				) : (
					<User className="size-7 sm:size-8 text-primary-600" strokeWidth={2} />
				)}
			</div>

			{/* Account Info */}
			<div className="flex-1 text-center sm:text-left">
				{/* Name */}
				{account.metadata?.name && (
					<h3 className="text-lg font-semibold text-neutral-900 mb-1 break-words">
						{account.metadata.name}
					</h3>
				)}

				{/* Username */}
				<div className="flex items-center justify-center sm:justify-start gap-1 text-neutral-600 mb-2">
					<AtSign className="size-4 shrink-0" />
					<span className="text-sm break-words">{account.username}</span>
				</div>

				{/* Bio */}
				{account.metadata?.bio && (
					<p className="text-sm text-neutral-600 line-clamp-4 sm:line-clamp-2">
						{account.metadata.bio}
					</p>
				)}
			</div>

			{/* Select Button */}
			<Button
				onClick={() => onSelect(account)}
				disabled={isSelecting}
				size="default"
				className="w-full sm:w-auto sm:ml-auto shrink-0"
			>
				{isSelecting ? "Selecting..." : "Select Account"}
			</Button>
		</div>
	);
}
