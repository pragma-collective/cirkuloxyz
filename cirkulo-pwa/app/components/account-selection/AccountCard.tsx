import { User, AtSign } from "lucide-react";
import { Button } from "app/components/ui/button";
import { cn } from "app/lib/utils";
import type { LensAccount } from "app/hooks/fetch-lens-accounts";

interface AccountCardProps {
	account: LensAccount;
	variant?: "featured" | "compact";
	onSelect: (account: LensAccount) => void;
	isSelecting?: boolean;
}

export function AccountCard({
	account,
	variant = "compact",
	onSelect,
	isSelecting = false,
}: AccountCardProps) {
	const isFeatured = variant === "featured";

	// Extract photo from metadata (Grove URI)
	const photoUri = account.metadata?.picture;

	return (
		<div
			className={cn(
				"bg-white/90 backdrop-blur-sm border-2 border-neutral-200 rounded-3xl transition-all duration-200",
				"hover:border-primary-500 hover:shadow-xl",
				isFeatured
					? "p-8 flex flex-col items-center text-center"
					: "p-6 flex items-center gap-4",
			)}
		>
			{/* Profile Photo */}
			<div
				className={cn(
					"rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shrink-0",
					isFeatured ? "size-24 mb-4" : "size-16",
				)}
			>
				{photoUri ? (
					<img
						src={photoUri}
						alt={account.metadata?.name || account.username}
						className={cn(
							"rounded-full object-cover",
							isFeatured ? "size-24" : "size-16",
						)}
					/>
				) : (
					<User
						className={cn(
							"text-primary-600",
							isFeatured ? "size-12" : "size-8",
						)}
						strokeWidth={2}
					/>
				)}
			</div>

			{/* Account Info */}
			<div
				className={cn(
					"flex-1",
					isFeatured ? "flex flex-col items-center" : "min-w-0",
				)}
			>
				{/* Name */}
				{account.metadata?.name && (
					<h3
						className={cn(
							"font-semibold text-neutral-900 truncate",
							isFeatured ? "text-2xl mb-2" : "text-lg mb-1",
						)}
					>
						{account.metadata.name}
					</h3>
				)}

				{/* Username */}
				<div
					className={cn(
						"flex items-center gap-1 text-neutral-600",
						isFeatured ? "justify-center mb-3" : "mb-2",
					)}
				>
					<AtSign className="size-4 shrink-0" />
					<span
						className={cn(
							"truncate",
							isFeatured ? "text-base" : "text-sm",
						)}
					>
						{account.username}
					</span>
				</div>

				{/* Bio */}
				{account.metadata?.bio && (
					<p
						className={cn(
							"text-neutral-600 line-clamp-2",
							isFeatured ? "text-base mb-6 max-w-md" : "text-sm mb-3",
						)}
					>
						{account.metadata.bio}
					</p>
				)}
			</div>

			{/* Select Button */}
			<Button
				onClick={() => onSelect(account)}
				disabled={isSelecting}
				size={isFeatured ? "lg" : "default"}
				className={cn(
					"shrink-0",
					isFeatured ? "w-full max-w-xs" : "ml-auto",
				)}
			>
				{isSelecting ? "Selecting..." : "Select Account"}
			</Button>
		</div>
	);
}
