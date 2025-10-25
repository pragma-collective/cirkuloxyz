import { cn } from "~/lib/utils";

export interface AssetBalanceCardProps {
  symbol: string; // "CBTC" or "CUSD"
  icon: string; // "₿" or "$"
  amount: string; // "0.0024"
  usdValue: string; // "$145.80"
  isLoading?: boolean;
  className?: string;
}

export function AssetBalanceCard({
  symbol,
  icon,
  amount,
  usdValue,
  isLoading = false,
  className,
}: AssetBalanceCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4",
          "animate-pulse",
          className
        )}
      >
        <div className="h-4 w-16 bg-white/20 rounded mb-2" />
        <div className="h-6 w-24 bg-white/20 rounded mb-1" />
        <div className="h-4 w-20 bg-white/20 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4",
        "hover:bg-white/15 transition-colors",
        className
      )}
    >
      {/* Symbol + Icon */}
      <p className="text-sm text-white/90 mb-1 flex items-center gap-1.5">
        <span className="text-base">{icon}</span>
        <span className="font-medium">{symbol}</span>
      </p>

      {/* Amount */}
      <p className="text-xl font-semibold text-white mb-1">{amount}</p>

      {/* USD Value */}
      <p className="text-sm text-white/80">{usdValue}</p>
    </div>
  );
}
