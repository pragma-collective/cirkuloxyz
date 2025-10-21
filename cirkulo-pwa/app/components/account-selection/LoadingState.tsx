import { Loader2 } from "lucide-react";

export function LoadingState() {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<Loader2 className="size-12 text-primary-600 animate-spin mb-6" />

			<h2 className="text-2xl font-bold text-neutral-900 mb-3 text-center">
				Loading Your Accounts
			</h2>

			<p className="text-neutral-600 text-center max-w-md">
				Please wait while we fetch your Lens accounts...
			</p>
		</div>
	);
}
