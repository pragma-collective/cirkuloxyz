import { FeedCard } from "../feed-card";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Sparkles } from "lucide-react";
import type { MilestoneFeedItem } from "app/types/feed";

export interface MilestoneItemProps {
  item: MilestoneFeedItem;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function MilestoneItem({
  item,
  onLike,
  onComment,
  onShare,
}: MilestoneItemProps) {
  return (
    <FeedCard
      item={item}
      accentColor="success"
      onLike={onLike}
      onComment={onComment}
      onShare={onShare}
    >
      {/* Celebration Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="size-12 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <Sparkles className="size-6 text-white" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-success-700 uppercase tracking-wide mb-0.5">
            Milestone Reached
          </p>
          <p className="text-base font-bold text-neutral-900">
            {item.circle.name} reached {item.percentage}% of goal!
          </p>
        </div>
      </div>

      {/* Milestone Visual */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-success-50 to-success-100/50 border-2 border-success-200 overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 size-32 bg-success-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 size-24 bg-success-400 rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-success-500 text-white font-bold text-2xl mb-3 shadow-xl">
            {item.percentage}%
          </div>

          <p className="text-sm text-neutral-700 mb-4">
            ${item.amount.toLocaleString()} saved toward your $
            {item.goalAmount.toLocaleString()} goal
          </p>

          {/* Member Avatars */}
          {item.circle.members && item.circle.members.length > 0 && (
            <>
              <div className="flex items-center justify-center -space-x-2">
                {item.circle.members.slice(0, 5).map((member) => (
                  <UserAvatar key={member.id} user={member} size="xs" />
                ))}
                {item.circle.members.length > 5 && (
                  <div className="size-8 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-neutral-700">
                    +{item.circle.members.length - 5}
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                {item.circle.members.length} friends celebrating together
              </p>
            </>
          )}
        </div>
      </div>

      {/* Celebration Reactions */}
      {item.reactions && item.reactions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-600">Reactions:</span>
          <div className="flex gap-1">
            {item.reactions.map((reaction, index) => (
              <button
                key={index}
                className="px-2 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
                aria-label={`React with ${reaction.emoji}`}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        </div>
      )}
    </FeedCard>
  );
}
