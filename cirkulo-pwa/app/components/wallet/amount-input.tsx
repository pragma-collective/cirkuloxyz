import { forwardRef } from "react";
import { useTokenPrice } from "~/hooks/use-token-price";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  token: "CBTC" | "CUSD";
  balance: number;
  estimatedFee: number;
  error?: string;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, token, balance, estimatedFee, error }, ref) => {
    const { formatUSD } = useTokenPrice(token);

    const handleMaxClick = () => {
      const maxAmount = Math.max(0, balance - estimatedFee);
      onChange(maxAmount.toFixed(8));
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-neutral-700"
          >
            Amount
          </label>
          <span className="text-sm text-neutral-600">
            Balance: {balance.toFixed(8)} {token}
          </span>
        </div>

        <div className="relative">
          <input
            ref={ref}
            id="amount"
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => {
              // Only allow numbers and a single decimal point
              const val = e.target.value;
              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                onChange(val);
              }
            }}
            placeholder="0.00"
            className={`
              w-full px-4 py-4 pr-24 rounded-xl border-2 transition-colors
              text-2xl font-semibold
              ${
                error
                  ? "border-[oklch(0.65_0.20_25)] focus:border-[oklch(0.65_0.20_25)] bg-red-50"
                  : "border-neutral-200 focus:border-[oklch(0.75_0.15_45)] bg-white"
              }
              focus:outline-none focus:ring-0
            `}
            aria-invalid={!!error}
            aria-describedby={error ? "amount-error" : "amount-usd"}
          />

          <button
            type="button"
            onClick={handleMaxClick}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              bg-[oklch(0.75_0.15_45)] text-white
              px-4 py-2 rounded-lg font-semibold
              hover:bg-[oklch(0.70_0.15_45)] transition-colors
              min-h-[44px]
            "
          >
            MAX
          </button>
        </div>

        {/* USD Equivalent */}
        {value && !error && parseFloat(value) > 0 && (
          <p
            id="amount-usd"
            className="text-lg text-neutral-600 font-medium"
            aria-live="polite"
          >
            ≈ {formatUSD(value)}
          </p>
        )}

        {error && (
          <p id="amount-error" className="text-sm text-[oklch(0.65_0.20_25)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AmountInput.displayName = "AmountInput";
