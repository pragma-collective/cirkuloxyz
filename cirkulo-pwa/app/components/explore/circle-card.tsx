import { Card, CardContent } from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Users, Clock, Plus, Share2, TrendingUp, Sparkles, Zap } from "lucide-react";
import { cn } from "app/lib/utils";
import type { Circle } from "app/types/feed";

export interface CircleCardProps {
  circle: Circle;
  onJoin?: (circleId: string) => void;
  onShare?: (circleId: string) => void;
  onClick?: (circleId: string) => void;
  badge?: "trending" | "new" | "nearly-complete";
  isUserMember?: boolean;
}

const formatMoney = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toLocaleString();
};

export function CircleCard({
  circle,
  onJoin,
  onShare,
  onClick,
  badge,
  isUserMember = false,
}: CircleCardProps) {
  const badgeConfig = {
    trending: {
      label: "Trending",
      icon: <TrendingUp className="size-3" />,
      className: "bg-warning-100 text-warning-700",
    },
    new: {
      label: "New",
      icon: <Sparkles className="size-3" />,
      className: "bg-secondary-100 text-secondary-700",
    },
    "nearly-complete": {
      label: "Almost There",
      icon: <Zap className="size-3" />,
      className: "bg-success-100 text-success-700",
    },
  };

  const handleClick = () => {
    // Pass lensGroupAddress for navigation, fallback to id
    onClick?.(circle.lensGroupAddress || circle.id);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoin?.(circle.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(circle.id);
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                border-2 border-neutral-200 hover:border-primary-300 overflow-hidden"
      onClick={handleClick}
      role="article"
      aria-label={`${circle.name} circle, ${circle.progress}% complete`}
    >
      {/* Accent bar */}
      <div
        className={cn(
          "h-1.5 bg-gradient-to-r",
          circle.progress >= 90
            ? "from-success-500 to-success-600"
            : "from-primary-500 to-secondary-500"
        )}
      />

      <CardContent className="!p-5 space-y-4">
        {/* Header: Emoji + Name - Full width for circle name */}
        <div className="flex items-start gap-3">
          <div className="size-12 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
            {circle.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-neutral-900 leading-tight">
              {circle.name}
            </h3>
            <p className="text-sm text-neutral-600 mt-0.5">{circle.goalName}</p>
          </div>
        </div>

        {/* Meta Row: Badge + Member Count */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          {badge && badgeConfig[badge] && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                badgeConfig[badge].className
              )}
            >
              {badgeConfig[badge].icon}
              {badgeConfig[badge].label}
            </span>
          )}

          {/* Member Count */}
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-700">
            <Users className="size-4" />
            <span className="font-medium">{circle.memberCount} members</span>
          </span>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              ${formatMoney(circle.currentAmount)}
            </span>
            <span className="text-sm text-neutral-600">
              of ${formatMoney(circle.goalAmount)}
            </span>
          </div>

          <div className="relative h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                circle.progress >= 90
                  ? "bg-gradient-to-r from-success-500 to-success-600"
                  : "bg-gradient-to-r from-primary-500 to-secondary-500"
              )}
              style={{ width: `${circle.progress}%` }}
              role="progressbar"
              aria-valuenow={circle.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${circle.progress}% of goal reached`}
            />
          </div>

          <p
            className={cn(
              "text-sm font-semibold",
              circle.progress >= 90 ? "text-success-600" : "text-primary-600"
            )}
          >
            {circle.progress}% complete
          </p>
        </div>

        {/* Activity Status */}
        <div className="flex items-center gap-1.5 text-sm text-neutral-600">
          <Clock className="size-4" />
          <span className="font-medium">Active today</span>
        </div>

        {/* Member Avatars */}
        {circle.members && circle.members.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {circle.members
                .filter((member) => member != null)
                .slice(0, 4)
                .map((member) => (
                  <UserAvatar
                    key={member.id}
                    user={member}
                    size="sm"
                    className="ring-2 ring-white"
                  />
                ))}
              {circle.memberCount > 4 && (
                <div className="size-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-xs font-semibold ring-2 ring-white">
                  +{circle.memberCount - 4}
                </div>
              )}
            </div>
            {circle.memberCount > 1 && (
              <span className="text-sm text-neutral-600 truncate">
                and {circle.memberCount - 1} {circle.memberCount - 1 === 1 ? "other" : "others"}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {isUserMember ? (
            <Button
              className="w-full"
              size="default"
              onClick={handleClick}
              aria-label={`View ${circle.name}`}
            >
              View Circle
            </Button>
          ) : (
            <Button
              className="w-full"
              size="default"
              onClick={handleJoinClick}
              aria-label={`Join ${circle.name}`}
            >
              <Plus className="size-4" />
              Join Circle
            </Button>
          )}

          <button
            className="w-full text-sm text-neutral-600 hover:text-neutral-900 py-2 transition-colors flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 rounded"
            onClick={handleShareClick}
            aria-label={`Share ${circle.name}`}
          >
            <Share2 className="size-3.5" />
            Share
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
