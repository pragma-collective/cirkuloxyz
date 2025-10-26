import { Link } from "react-router";
import type { Transaction } from "~/hooks/use-transactions";
import { TransactionListItem } from "./transaction-list-item";
import { EmptyWalletState } from "./empty-wallet-state";
import { cn } from "~/lib/utils";

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  hasBalance?: boolean;
  className?: string;
  showViewAll?: boolean;
}

export function TransactionList({
  transactions,
  isLoading = false,
  hasBalance = false,
  className,
  showViewAll = true,
}: TransactionListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn("bg-white", className)}>
        {/* Section Header */}
        <div className="px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">
            Recent Transactions
          </h2>
        </div>

        {/* Loading Skeleton */}
        <div className="divide-y divide-stone-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-4 animate-pulse">
              <div className="flex gap-3">
                <div className="size-5 bg-stone-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                  <div className="h-3 bg-stone-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className={cn("bg-white", className)}>
        {/* Section Header */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">
            Recent Transactions
          </h2>
        </div>

        {/* Empty State */}
        {hasBalance ? (
          <EmptyWalletState type="no-transactions" />
        ) : (
          <EmptyWalletState type="no-balance" />
        )}
      </div>
    );
  }

  // Transactions list
  return (
    <div className={cn("bg-white", className)}>
      {/* Section Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">
          Recent Transactions
        </h2>
        {showViewAll && (
          <Link
            to="/wallet/transactions"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View All →
          </Link>
        )}
      </div>

      {/* Transaction Items */}
      <div className="divide-y divide-stone-200">
        {transactions.map((transaction) => (
          <TransactionListItem
            key={transaction.txHash}
            transaction={transaction}
            onClick={() => {
              console.log("Transaction clicked:", transaction.txHash);
              // Future: Navigate to transaction detail page
              // navigate(`/wallet/transaction/${transaction.txHash}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
