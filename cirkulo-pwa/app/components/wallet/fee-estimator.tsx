import { Info } from "lucide-react";
import { useTokenPrice } from "~/hooks/use-token-price";

interface FeeEstimatorProps {
  token: "CBTC" | "CUSD";
  estimatedFee: number;
}

export function FeeEstimator({ token, estimatedFee }: FeeEstimatorProps) {
  const { formatUSD } = useTokenPrice(token);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
      <div className="flex items-start gap-2">
        <Info
          className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900">
            Network Fee
          </h3>
          <p className="text-xs text-amber-700 mt-1">
            Estimated gas fee for this transaction on Citrea network
          </p>
        </div>
      </div>

      <div className="flex items-baseline justify-between pt-2">
        <span className="text-sm text-amber-700">Estimated Fee:</span>
        <div className="text-right">
          <span className="text-lg font-semibold text-amber-900">
            {estimatedFee.toFixed(8)} {token}
          </span>
          <p className="text-xs text-amber-700">
            ≈ {formatUSD(estimatedFee)}
          </p>
        </div>
      </div>
    </div>
  );
}
