import { UserX, ArrowRight } from "lucide-react";
import { Button } from "app/components/ui/button";
import { useNavigate } from "react-router";

export function EmptyState() {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
				<UserX className="size-10 text-neutral-400" strokeWidth={2} />
			</div>

			<h2 className="text-2xl font-bold text-neutral-900 mb-3 text-center">
				No Lens Accounts Found
			</h2>

			<p className="text-neutral-600 text-center mb-8 max-w-md">
				You don't have any Lens accounts associated with this wallet. Create
				your first account to get started.
			</p>

			<Button
				size="lg"
				onClick={() => navigate("/onboarding")}
				className="gap-2"
			>
				Create Lens Account
				<ArrowRight className="size-5" />
			</Button>
		</div>
	);
}
