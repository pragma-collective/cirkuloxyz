import { cn } from "app/lib/utils";

interface AccountCardSkeletonProps {
	variant?: "featured" | "compact";
}

export function AccountCardSkeleton({
	variant = "compact",
}: AccountCardSkeletonProps) {
	const isFeatured = variant === "featured";

	return (
		<div
			className={cn(
				"bg-white/90 backdrop-blur-sm border-2 border-neutral-200 rounded-3xl animate-pulse",
				isFeatured
					? "p-8 flex flex-col items-center"
					: "p-6 flex items-center gap-4",
			)}
		>
			{/* Profile Photo Skeleton */}
			<div
				className={cn(
					"rounded-full bg-neutral-200 shrink-0",
					isFeatured ? "size-24 mb-4" : "size-16",
				)}
			/>

			{/* Account Info Skeleton */}
			<div
				className={cn(
					"flex-1 space-y-3",
					isFeatured ? "flex flex-col items-center w-full" : "min-w-0",
				)}
			>
				{/* Name Skeleton */}
				<div
					className={cn(
						"bg-neutral-200 rounded-lg",
						isFeatured ? "h-8 w-48" : "h-6 w-32",
					)}
				/>

				{/* Username Skeleton */}
				<div
					className={cn(
						"bg-neutral-200 rounded-lg",
						isFeatured ? "h-5 w-36" : "h-4 w-24",
					)}
				/>

				{/* Bio Skeleton (2 lines) */}
				{isFeatured && (
					<div className="space-y-2 w-full max-w-md">
						<div className="bg-neutral-200 rounded-lg h-4 w-full" />
						<div className="bg-neutral-200 rounded-lg h-4 w-3/4" />
					</div>
				)}
			</div>

			{/* Button Skeleton */}
			<div
				className={cn(
					"bg-neutral-200 rounded-lg shrink-0",
					isFeatured ? "h-12 w-full max-w-xs mt-6" : "h-10 w-32 ml-auto",
				)}
			/>
		</div>
	);
}
