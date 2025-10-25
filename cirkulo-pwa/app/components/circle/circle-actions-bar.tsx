import { UserPlus, Share2, MoreHorizontal } from "lucide-react";
import type { Circle } from "app/types/feed";
import { cn } from "app/lib/utils";

export interface CircleActionsBarProps {
  circle: Circle;
  onInvite: () => void;
  onShare: () => void;
  onMore?: () => void;
  isOwner?: boolean;
  className?: string;
}

export function CircleActionsBar({
  circle,
  onInvite,
  onShare,
  onMore,
  isOwner = false,
  className,
}: CircleActionsBarProps) {
  // Only show Invite for contribution/rotating circles and if user is owner
  const showInvite =
    isOwner && (circle.circleType === "contribution" || circle.circleType === "rotating");

  return (
    <div
      className={cn(
        "bg-white border-b border-neutral-200",
        "transition-all duration-200",
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Invite Button */}
          {showInvite && (
            <button
              onClick={onInvite}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <UserPlus className="size-4" />
              <span>Invite</span>
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Share2 className="size-4" />
            <span>Share</span>
          </button>

          {/* More Button */}
          {onMore && (
            <button
              onClick={onMore}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <MoreHorizontal className="size-4" />
              <span>More</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
