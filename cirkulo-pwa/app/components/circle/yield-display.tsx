import { useMemo } from "react";
import { type Address, formatEther } from "viem";
import { TrendingUp } from "lucide-react";
import { cn } from "app/lib/utils";
import { useYieldBalance } from "app/hooks/use-yield-balance";

export interface YieldDisplayProps {
  poolAddress: Address;
  memberAddress: Address;
  currency: "cusd" | "cbtc";
  className?: string;
}

/**
 * Displays yield earnings for a member in a YieldSavingsPool
 * Shows principal, yield earned, total balance, and APY
 * Uses currency-specific theming (orange for cBTC, green for CUSD)
 */
export function YieldDisplay({
  poolAddress,
  memberAddress,
  currency,
  className,
}: YieldDisplayProps) {
  const { principal, totalBalance, yieldEarned, yieldPercentage, apy, isLoading } =
    useYieldBalance(poolAddress, memberAddress, currency);

  // Currency-specific theming
  const theme = useMemo(() => {
    if (currency === "cbtc") {
      return {
        bg: "from-warning-50 to-warning-100",
        border: "border-warning-200",
        text: "text-warning-900",
        textLight: "text-warning-700",
        bgLight: "bg-warning-50",
        icon: "₿",
      };
    }
    return {
      bg: "from-success-50 to-success-100",
      border: "border-success-200",
      text: "text-success-900",
      textLight: "text-success-700",
      bgLight: "bg-success-50",
      icon: "📈",
    };
  }, [currency]);

  // Format currency amounts
  const formatCurrency = (amount: bigint) => {
    if (currency === "cbtc") {
      // cBTC: Show up to 8 decimals, remove trailing zeros
      const formatted = formatEther(amount);
      const trimmed = Number(formatted).toFixed(8).replace(/\.?0+$/, "");
      return `${trimmed} cBTC`;
    }
    // CUSD: Show as dollars with 2 decimal places
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(formatEther(amount)));
  };

  // Calculate projected annual yield
  const projectedAnnualYield = useMemo(() => {
    if (principal === 0n) return 0n;
    return (principal * BigInt(Math.floor(apy * 100))) / 10000n;
  }, [principal, apy]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn(
        `bg-gradient-to-br ${theme.bg} rounded-xl p-4 border ${theme.border} animate-pulse`,
        className
      )}>
        <div className="space-y-3">
          <div className="h-6 bg-white/50 rounded w-1/3"></div>
          <div className="h-10 bg-white/50 rounded w-1/2"></div>
          <div className="h-4 bg-white/50 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Only hide if member has never deposited (no principal)
  if (principal === 0n) {
    return null;
  }

  return (
    <div className={cn(
      `bg-gradient-to-br ${theme.bg} rounded-xl p-4 sm:p-6 border ${theme.border}`,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 bg-gradient-to-br rounded-lg",
            currency === "cbtc"
              ? "from-warning-400 to-warning-500"
              : "from-success-400 to-success-500"
          )}>
            <TrendingUp className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <span className={cn("text-sm sm:text-base font-semibold", theme.text)}>
            Your Yield Earnings
          </span>
        </div>
        <div className={cn(
          "px-2 sm:px-3 py-1 sm:py-1.5 bg-white/50 rounded-lg border",
          theme.border
        )}>
          <span className={cn("text-xs sm:text-sm font-bold", theme.text)}>
            {apy}% APY {theme.icon}
          </span>
        </div>
      </div>

      {/* Yield Amount */}
      <div className="mb-4">
        <p className={cn("text-2xl sm:text-3xl font-bold", theme.text)}>
          +{formatCurrency(yieldEarned)}
        </p>
        <p className={cn("text-xs sm:text-sm mt-1", theme.textLight)}>
          +{yieldPercentage.toFixed(2)}% return on your contribution
        </p>
      </div>

      {/* Breakdown */}
      <div className={cn(
        "pt-3 border-t space-y-2",
        theme.border
      )}>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className={theme.textLight}>Your Principal</span>
          <span className={cn("font-semibold", theme.text)}>
            {formatCurrency(principal)}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className={cn("font-medium", theme.text)}>Total Balance</span>
          <span className={cn("font-bold", theme.text)}>
            {formatCurrency(totalBalance)}
          </span>
        </div>
      </div>

      {/* Projection */}
      <div className={cn(
        "mt-3 pt-3 border-t",
        theme.border
      )}>
        <details className="group">
          <summary className={cn(
            "text-xs cursor-pointer hover:opacity-80 transition-opacity list-none flex items-center justify-between",
            theme.textLight
          )}>
            <span>Projected earnings</span>
            <span className="group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className={cn("mt-2 text-xs", theme.textLight)}>
            <p>
              At {apy}% APY, you'll earn approximately{" "}
              <span className={cn("font-semibold", theme.text)}>
                {formatCurrency(projectedAnnualYield)}
              </span>
              {" "}per year on your current principal.
            </p>
            <p className="mt-1 text-xs opacity-75">
              {currency === "cbtc"
                ? "🪙 Conservative Bitcoin yield, earn passive income while holding cBTC."
                : "💵 Higher yield on stablecoin deposits, perfect for maximizing returns."}
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
