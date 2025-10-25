import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import type { Transaction } from "~/hooks/use-transactions";
import { formatAddress } from "~/lib/format-address";
import { formatRelativeTime } from "~/lib/format-timestamp";
import { cn } from "~/lib/utils";

export interface TransactionListItemProps {
  transaction: Transaction;
  onClick?: () => void;
  className?: string;
}

export function TransactionListItem({
  transaction,
  onClick,
  className,
}: TransactionListItemProps) {
  const { type, amount, token, counterparty, timestamp, status } = transaction;

  // Determine icon and colors based on type and status
  const getIcon = () => {
    if (status === "pending") {
      return <Clock className="size-5 text-yellow-600 animate-spin" />;
    }
    if (type === "receive") {
      return <ArrowDownCircle className="size-5 text-green-600" />;
    }
    return <ArrowUpCircle className="size-5 text-orange-600" />;
  };

  const getAmountColor = () => {
    if (type === "receive") {
      return "text-green-600";
    }
    return "text-stone-900";
  };

  const getStatusText = () => {
    switch (status) {
      case "confirmed":
        return (
          <span className="text-xs text-green-600 font-medium">
            ✓ Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="text-xs text-yellow-600 font-medium">
            ⏳ Pending
          </span>
        );
      case "failed":
        return (
          <span className="text-xs text-red-600 font-medium">✗ Failed</span>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-4 text-left",
        "hover:bg-stone-50 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
        className
      )}
      aria-label={`${type === "receive" ? "Received" : "Sent"} ${amount} ${token} ${type === "receive" ? "from" : "to"} ${formatAddress(counterparty)}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Type + Amount */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-base font-medium text-stone-900">
              {type === "receive" ? "Received" : "Sent"}
            </p>
            <p className={cn("text-base font-semibold", getAmountColor())}>
              {type === "receive" ? "+" : "-"}
              {amount} {token}
            </p>
          </div>

          {/* Counterparty */}
          <p className="text-sm text-stone-600 mb-1.5">
            {type === "receive" ? "From" : "To"} {formatAddress(counterparty)}
          </p>

          {/* Timestamp + Status */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-stone-500">
              {formatRelativeTime(timestamp)}
            </span>
            {getStatusText()}
          </div>
        </div>
      </div>
    </button>
  );
}
