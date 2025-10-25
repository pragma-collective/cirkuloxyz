import { Bitcoin, DollarSign, ArrowRight } from "lucide-react";
import { formatAddress } from "~/lib/format-address";
import { useTokenPrice } from "~/hooks/use-token-price";

interface TransactionSummaryProps {
  token: "CBTC" | "CUSD";
  amount: string;
  recipient: string;
  fee: number;
  total: number;
  ensName?: string | null;
}

export function TransactionSummary({
  token,
  amount,
  recipient,
  fee,
  total,
  ensName,
}: TransactionSummaryProps) {
  const { formatUSD } = useTokenPrice(token);
  const amountNum = parseFloat(amount) || 0;

  const TokenIcon = token === "CBTC" ? Bitcoin : DollarSign;
  const tokenColor =
    token === "CBTC" ? "oklch(0.75_0.15_45)" : "oklch(0.70_0.18_290)";

  return (
    <div className="rounded-3xl border-2 border-neutral-200 shadow-xl bg-white p-6 space-y-6">
      <h2 className="text-xl font-bold text-neutral-900">Review Transaction</h2>

      {/* Sending Amount */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-600">Sending</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${tokenColor}20` }}
            >
              <TokenIcon
                className="w-5 h-5"
                style={{ color: tokenColor }}
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {amountNum.toFixed(8)} {token}
              </p>
              <p className="text-sm text-neutral-600">{formatUSD(amount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200" aria-hidden="true" />

      {/* Recipient */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-600">To</p>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
            {ensName
              ? ensName.charAt(0).toUpperCase()
              : recipient.slice(2, 4).toUpperCase()}
          </div>
          <div>
            {ensName && (
              <p className="font-semibold text-neutral-900">{ensName}</p>
            )}
            <p className="text-sm font-mono text-neutral-600">
              {formatAddress(recipient)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200" aria-hidden="true" />

      {/* Network Fee */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-600">Network Fee</p>
        <div className="text-right">
          <p className="font-semibold text-neutral-900">
            {fee.toFixed(8)} {token}
          </p>
          <p className="text-xs text-neutral-600">{formatUSD(fee)}</p>
        </div>
      </div>

      <div className="border-t-2 border-neutral-300" aria-hidden="true" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-neutral-900">Total</p>
        <div className="text-right">
          <p className="text-xl font-bold text-neutral-900">
            {total.toFixed(8)} {token}
          </p>
          <p className="text-sm text-neutral-600">{formatUSD(total)}</p>
        </div>
      </div>
    </div>
  );
}
