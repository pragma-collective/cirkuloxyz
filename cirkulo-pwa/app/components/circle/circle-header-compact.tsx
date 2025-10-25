import { ChevronDown } from "lucide-react";
import type { Circle } from "app/types/feed";
import { cn } from "app/lib/utils";

export interface CircleHeaderCompactProps {
  circle: Circle;
  onExpand: () => void;
  className?: string;
}

export function CircleHeaderCompact({
  circle,
  onExpand,
  className,
}: CircleHeaderCompactProps) {
  // Format currency based on token type
  const formatCurrency = (amount: number, currency?: "cusd" | "cbtc"): string => {
    if (currency === "cbtc") {
      // cBTC: Show up to 8 decimals, but remove trailing zeros
      const formatted = amount.toFixed(8).replace(/\.?0+$/, "");
      return `${formatted} cBTC`;
    }

    // CUSD/USD: Show as dollars with 2 decimal places
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Determine key metric to display based on circle type
  const getKeyMetric = () => {
    if (circle.circleType === "rotating") {
      const totalRounds = circle.memberCount || 12;
      const currentRound = Math.max(1, Math.ceil((circle.progress / 100) * totalRounds));
      return {
        label: "Current Round",
        value: `${currentRound}/${totalRounds}`,
      };
    }

    if (circle.circleType === "fundraising") {
      return {
        label: "Raised",
        value: formatCurrency(circle.currentAmount, circle.currency),
      };
    }

    // contribution type
    return {
      label: "Total Saved",
      value: formatCurrency(circle.currentAmount, circle.currency),
    };
  };

  const keyMetric = getKeyMetric();

  return (
    <button
      onClick={onExpand}
      className={cn(
        "sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200",
        "hover:bg-neutral-50/95 transition-colors duration-200",
        "active:bg-neutral-100/95",
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Circle Identity */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Circle Emoji */}
            <div className="flex-shrink-0 size-10 sm:size-12 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
              {circle.emoji || "🎯"}
            </div>

            {/* Circle Name */}
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
                {circle.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 truncate">
                {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          {/* Right: Key Metric + Expand Icon */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Key Metric */}
            <div className="text-right">
              <p className="text-xs text-neutral-600 mb-0.5">{keyMetric.label}</p>
              <p className="text-sm sm:text-base font-bold text-neutral-900">
                {keyMetric.value}
              </p>
            </div>

            {/* Expand Icon */}
            <ChevronDown className="size-5 sm:size-6 text-neutral-400 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </button>
  );
}
