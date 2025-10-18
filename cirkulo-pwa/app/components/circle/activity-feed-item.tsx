import * as React from "react";
import type {
  FeedItem,
  ContributionFeedItem,
  MilestoneFeedItem,
  MemberJoinedFeedItem,
  CelebrationFeedItem,
} from "app/types/feed";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Button } from "app/components/ui/button";
import {
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  UserPlus,
  Trophy,
  Sparkles,
} from "lucide-react";
import { cn } from "app/lib/utils";

export interface ActivityFeedItemProps {
  item: FeedItem;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  className?: string;
}

export function ActivityFeedItem({
  item,
  onLike,
  onComment,
  className,
}: ActivityFeedItemProps) {
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Render activity icon based on type
  const renderIcon = () => {
    switch (item.type) {
      case "contribution":
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center text-white shadow-md">
            <DollarSign className="size-5 sm:size-6" />
          </div>
        );
      case "milestone":
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-md">
            <TrendingUp className="size-5 sm:size-6" />
          </div>
        );
      case "member-joined":
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white shadow-md">
            <UserPlus className="size-5 sm:size-6" />
          </div>
        );
      case "goal-completed":
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center text-white shadow-md">
            <Trophy className="size-5 sm:size-6" />
          </div>
        );
      case "celebration":
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white shadow-md">
            <Sparkles className="size-5 sm:size-6" />
          </div>
        );
      default:
        return (
          <UserAvatar user={item.actor} size="md" />
        );
    }
  };

  // Render activity text based on type
  const renderActivityText = () => {
    switch (item.type) {
      case "contribution": {
        const contribItem = item as ContributionFeedItem;
        return (
          <div>
            <p className="text-sm sm:text-base text-neutral-900">
              <span className="font-semibold">{item.actor.name}</span> contributed{" "}
              <span className="font-bold text-success-600">
                {formatCurrency(contribItem.amount)}
              </span>
            </p>
            {contribItem.message && (
              <p className="text-sm text-neutral-700 mt-1">{contribItem.message}</p>
            )}
            <div className="mt-2 bg-neutral-50 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>Circle Progress</span>
                <span className="font-semibold text-primary-600">
                  {contribItem.circleProgress.percentage}%
                </span>
              </div>
              <div className="relative h-1.5 bg-neutral-200 rounded-full overflow-hidden mt-1.5">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  style={{ width: `${contribItem.circleProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      }
      case "milestone": {
        const milestoneItem = item as MilestoneFeedItem;
        return (
          <div>
            <p className="text-sm sm:text-base text-neutral-900">
              <span className="font-semibold">{item.actor.name}</span> reached the{" "}
              <span className="font-bold text-primary-600">
                {milestoneItem.percentage}% milestone
              </span>
              !
            </p>
            <div className="mt-2 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg px-3 py-2 border border-primary-200">
              <p className="text-sm font-semibold text-neutral-900">
                {formatCurrency(milestoneItem.amount)} saved
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                {formatCurrency(milestoneItem.goalAmount - milestoneItem.amount)} to go
              </p>
            </div>
            {milestoneItem.reactions && milestoneItem.reactions.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {milestoneItem.reactions.map((reaction, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                      reaction.userReacted
                        ? "bg-primary-100 text-primary-700 ring-1 ring-primary-300"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLike(item.id);
                    }}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }
      case "member-joined": {
        const memberItem = item as MemberJoinedFeedItem;
        return (
          <div>
            <p className="text-sm sm:text-base text-neutral-900">
              <span className="font-semibold">{item.actor.name}</span> joined the circle
            </p>
            {memberItem.welcomeMessage && (
              <div className="mt-2 bg-secondary-50 rounded-lg px-3 py-2 border border-secondary-200">
                <p className="text-sm text-neutral-700">{memberItem.welcomeMessage}</p>
              </div>
            )}
          </div>
        );
      }
      case "celebration": {
        const celebItem = item as CelebrationFeedItem;
        return (
          <div>
            <p className="text-sm sm:text-base text-neutral-900 mb-2">
              <span className="font-semibold">{item.actor.name}</span>
            </p>
            <p className="text-sm text-neutral-700 whitespace-pre-line">
              {celebItem.content}
            </p>
            {celebItem.imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden">
                <img
                  src={celebItem.imageUrl}
                  alt={celebItem.imageAlt || "Celebration image"}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            )}
            {celebItem.tags && celebItem.tags.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {celebItem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }
      default:
        return (
          <p className="text-sm sm:text-base text-neutral-900">
            <span className="font-semibold">{item.actor.name}</span> posted an update
          </p>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 sm:gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors",
        className
      )}
    >
      {/* Activity Icon or Avatar */}
      <div className="flex-shrink-0">{renderIcon()}</div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">{renderActivityText()}</div>
          <span className="text-xs text-neutral-500 flex-shrink-0">
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>

        {/* Engagement Buttons */}
        <div className="flex items-center gap-4 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLike(item.id);
            }}
            className={cn(
              "gap-2 text-xs h-8 px-3",
              item.isLiked && "text-error-600"
            )}
          >
            <Heart
              className={cn("size-4", item.isLiked && "fill-current")}
            />
            <span>{item.likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onComment(item.id);
            }}
            className="gap-2 text-xs h-8 px-3"
          >
            <MessageCircle className="size-4" />
            <span>{item.commentCount}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
