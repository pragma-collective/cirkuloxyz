import { FeedCard } from "../feed-card";
import { Coins, TrendingUp } from "lucide-react";
import type { ContributionFeedItem } from "app/types/feed";

export interface ContributionItemProps {
  item: ContributionFeedItem;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function ContributionItem({
  item,
  onLike,
  onComment,
  onShare,
}: ContributionItemProps) {
  return (
    <FeedCard
      item={item}
      accentColor="warning"
      onLike={onLike}
      onComment={onComment}
      onShare={onShare}
    >
      {/* Header with circle badge */}
      <div className="flex items-center gap-2 mb-2">
        <div className="size-6 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
          <Coins className="size-3.5 text-warning-700" />
        </div>
        <p className="text-sm text-neutral-700">
          <span className="font-semibold">{item.actor.name}</span> contributed to{" "}
          <span className="font-semibold text-secondary-700">{item.circle.name}</span>
        </p>
      </div>

      {/* Amount Display */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-warning-50 to-warning-100/50 border border-warning-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 mb-1">Contribution Amount</p>
            <p className="text-3xl font-bold text-neutral-900">
              {item.currency}
              {item.amount.toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-full bg-warning-200/50">
            <TrendingUp className="size-6 text-warning-700" />
          </div>
        </div>

        {/* Goal progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
            <span>Circle Progress</span>
            <span className="font-semibold">
              ${item.circleProgress.current.toLocaleString()} / $
              {item.circleProgress.goal.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-warning-500 to-warning-600 rounded-full transition-all duration-500"
              style={{ width: `${item.circleProgress.percentage}%` }}
              role="progressbar"
              aria-valuenow={item.circleProgress.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${item.circleProgress.percentage}% of goal reached`}
            />
          </div>
        </div>
      </div>

      {/* Optional: Encouraging message */}
      {item.message && (
        <p className="text-sm text-neutral-600 italic">"{item.message}"</p>
      )}
    </FeedCard>
  );
}
