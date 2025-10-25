import { Inbox, Wallet } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export interface EmptyWalletStateProps {
  type: "no-balance" | "no-transactions";
  className?: string;
}

export function EmptyWalletState({
  type,
  className,
}: EmptyWalletStateProps) {
  const navigate = useNavigate();

  if (type === "no-balance") {
    return (
      <div className={cn("py-12 px-4 text-center", className)}>
        <div className="flex justify-center mb-4">
          <Wallet className="size-12 text-stone-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">
          Get Started
        </h3>
        <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
          Add funds to your wallet to start saving with your circles
        </p>
        <Button
          onClick={() => navigate("/wallet/on-ramp")}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
        >
          Fund Wallet
        </Button>
      </div>
    );
  }

  // no-transactions
  return (
    <div className={cn("py-12 px-4 text-center", className)}>
      <div className="flex justify-center mb-4">
        <Inbox className="size-12 text-stone-400" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 mb-2">
        No transactions yet
      </h3>
      <p className="text-sm text-stone-600 max-w-md mx-auto">
        Your transaction history will appear here
      </p>
    </div>
  );
}
