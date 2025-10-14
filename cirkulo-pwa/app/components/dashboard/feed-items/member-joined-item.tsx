import { FeedCard } from "../feed-card";
import { UserAvatar } from "app/components/ui/user-avatar";
import { UserPlus, Users, Target } from "lucide-react";
import type { MemberJoinedFeedItem } from "app/types/feed";

export interface MemberJoinedItemProps {
  item: MemberJoinedFeedItem;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function MemberJoinedItem({
  item,
  onLike,
  onComment,
  onShare,
}: MemberJoinedItemProps) {
  return (
    <FeedCard
      item={item}
      accentColor="secondary"
      onLike={onLike}
      onComment={onComment}
      onShare={onShare}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <UserAvatar user={item.actor} size="md" />
          <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-secondary-500 flex items-center justify-center shadow-md">
            <UserPlus className="size-3.5 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-neutral-700 mb-1">
            <span className="font-semibold text-neutral-900">{item.actor.name}</span>{" "}
            joined{" "}
            <span className="font-semibold text-secondary-700">
              {item.circle.name}
            </span>
          </p>
        </div>
      </div>

      {/* Welcome Message */}
      {item.welcomeMessage && (
        <div className="p-4 rounded-xl bg-secondary-50 border border-secondary-100">
          <p className="text-sm text-neutral-700">{item.welcomeMessage}</p>
        </div>
      )}

      {/* Circle Info */}
      <div className="flex items-center justify-between text-xs text-neutral-600 pt-2">
        <div className="flex items-center gap-1">
          <Users className="size-3.5" />
          <span>{item.circle.memberCount} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="size-3.5" />
          <span>Goal: ${item.circle.goalAmount.toLocaleString()}</span>
        </div>
      </div>
    </FeedCard>
  );
}
