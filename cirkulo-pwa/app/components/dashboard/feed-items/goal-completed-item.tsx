import { FeedCard } from "../feed-card";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Button } from "app/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";
import type { GoalCompletedFeedItem } from "app/types/feed";

export interface GoalCompletedItemProps {
  item: GoalCompletedFeedItem;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onCelebrate?: () => void;
}

export function GoalCompletedItem({
  item,
  onLike,
  onComment,
  onShare,
  onCelebrate,
}: GoalCompletedItemProps) {
  return (
    <FeedCard
      item={item}
      accentColor="warning"
      onLike={onLike}
      onComment={onComment}
      onShare={onShare}
    >
      <div className="relative overflow-hidden">
        {/* Animated background (subtle gradient) */}
        <div className="absolute inset-0 bg-gradient-to-br from-success-100 via-warning-50 to-primary-100 opacity-50 pointer-events-none" />

        <div className="relative z-10">
          {/* Trophy Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-warning-400 to-warning-600 shadow-2xl mb-3">
              <Trophy className="size-10 text-white" />
            </div>

            <h3 className="text-xl font-bold text-neutral-900 mb-1">
              Goal Completed!
            </h3>
            <p className="text-sm text-neutral-600">
              {item.circle.name} reached their {item.circle.goalName} goal
            </p>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-white/80 backdrop-blur-sm">
              <p className="text-2xl font-bold text-neutral-900">
                ${item.totalSaved.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-600">Total Saved</p>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/80 backdrop-blur-sm">
              <p className="text-2xl font-bold text-neutral-900">
                {item.circle.memberCount}
              </p>
              <p className="text-xs text-neutral-600">Members</p>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/80 backdrop-blur-sm">
              <p className="text-2xl font-bold text-neutral-900">
                {item.daysToComplete}
              </p>
              <p className="text-xs text-neutral-600">Days</p>
            </div>
          </div>

          {/* Member Grid */}
          {item.circle.members && item.circle.members.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
              {item.circle.members.slice(0, 8).map((member) => (
                <div key={member.id} className="text-center">
                  <UserAvatar user={member} size="sm" />
                  <p className="text-xs text-neutral-600 mt-1">
                    {member.name?.split(" ")[0] || "User"}
                  </p>
                </div>
              ))}
              {item.circle.members.length > 8 && (
                <div className="text-center">
                  <div className="size-10 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-700">
                    +{item.circle.members.length - 8}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Celebration CTA */}
          {onCelebrate && (
            <Button className="w-full" variant="default" onClick={onCelebrate}>
              <Sparkles className="size-4" />
              Celebrate Together
            </Button>
          )}
        </div>
      </div>
    </FeedCard>
  );
}
