import * as React from "react";
import { Card, CardContent } from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { cn } from "app/lib/utils";
import type { BaseFeedItem } from "app/types/feed";

export interface FeedCardProps {
  item: BaseFeedItem;
  accentColor?: "primary" | "secondary" | "success" | "warning";
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onMenu?: () => void;
  children: React.ReactNode;
}

const accentColors = {
  primary: "from-primary-500 to-secondary-500",
  secondary: "from-secondary-500 to-secondary-600",
  success: "from-success-500 to-success-600",
  warning: "from-warning-500 to-warning-600",
};

export function FeedCard({
  item,
  accentColor = "primary",
  onLike,
  onComment,
  onShare,
  onMenu,
  children,
}: FeedCardProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-200 bg-white overflow-hidden group">
      {/* Accent bar on left edge */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b",
          accentColors[accentColor]
        )}
      />

      <CardContent className="!p-4 sm:!p-5">
        {/* Card Header: Avatar + Meta */}
        <div className="flex items-start gap-3 mb-3">
          <UserAvatar user={item.actor} size="sm" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900">
              {item.actor.name || "Anonymous"}
            </p>
            <p className="text-xs text-neutral-600">{formatTimestamp(item.timestamp)}</p>
          </div>

          {/* Action menu */}
          {onMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenu}
              aria-label="More options"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          )}
        </div>

        {/* Card Content (varies by type) */}
        <div className="space-y-3">{children}</div>

        {/* Card Footer: Actions */}
        <div className="flex items-center gap-4 pt-3 mt-3 border-t border-neutral-100">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-neutral-600 transition-all duration-200",
              item.isLiked && "text-error-600 bg-error-100 hover:bg-error-200"
            )}
            onClick={onLike}
            aria-label={item.isLiked ? "Unlike" : "Like"}
            aria-pressed={item.isLiked}
          >
            <Heart
              className={cn(
                "size-4 transition-all duration-200",
                item.isLiked && "fill-current"
              )}
            />
            {item.likeCount > 0 && (
              <span className="ml-1.5">{item.likeCount}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-600"
            onClick={onComment}
            aria-label={`Comment (${item.commentCount} comments)`}
          >
            <MessageCircle className="size-4" />
            {item.commentCount > 0 && (
              <span className="ml-1.5">{item.commentCount}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-600 ml-auto"
            onClick={onShare}
            aria-label="Share"
          >
            <Share2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
