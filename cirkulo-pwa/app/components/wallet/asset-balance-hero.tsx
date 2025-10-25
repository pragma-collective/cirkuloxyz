import { AssetBalanceCard } from "./asset-balance-card";
import { formatCryptoAmount, formatUSD } from "~/lib/format-currency";
import type { WalletBalances } from "~/hooks/use-wallet-balances";
import { cn } from "~/lib/utils";

export interface AssetBalanceHeroProps {
  balances: WalletBalances | null;
  isLoading?: boolean;
  className?: string;
}

export function AssetBalanceHero({
  balances,
  isLoading = false,
  className,
}: AssetBalanceHeroProps) {
  return (
    <div
      className={cn(
        "min-h-[200px] px-4 py-8",
        "bg-gradient-to-br from-orange-500 to-purple-600",
        "text-white",
        className
      )}
    >
      {/* Total Balance */}
      <div className="text-center mb-6">
        <p className="text-sm text-white/80 mb-2">Total Balance</p>
        {isLoading ? (
          <div className="h-10 w-32 bg-white/20 rounded mx-auto animate-pulse" />
        ) : (
          <p className="text-4xl font-bold">
            {balances ? formatUSD(balances.total) : "$0.00"}
          </p>
        )}
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <AssetBalanceCard
          symbol="CBTC"
          icon="₿"
          amount={
            balances ? formatCryptoAmount(balances.cbtc.amount) : "0.0000"
          }
          usdValue={balances ? formatUSD(balances.cbtc.usdValue) : "$0.00"}
          isLoading={isLoading}
        />
        <AssetBalanceCard
          symbol="CUSD"
          icon="$"
          amount={
            balances ? formatCryptoAmount(balances.cusd.amount, 2) : "0.00"
          }
          usdValue={balances ? formatUSD(balances.cusd.usdValue) : "$0.00"}
          isLoading={isLoading}
        />
      </div>

      {/* Empty State Hint */}
      {!isLoading && balances && parseFloat(balances.total) === 0 && (
        <p className="text-center text-sm text-white/70 mt-4">
          Tap On-ramp below to add funds
        </p>
      )}
    </div>
  );
}
