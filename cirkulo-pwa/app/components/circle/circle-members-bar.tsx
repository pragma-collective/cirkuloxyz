import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import type { Circle } from "app/types/feed";
import type { GroupMember } from "@lens-protocol/client";
import { cn } from "app/lib/utils";

export interface CircleMembersBarProps {
  circle: Circle;
  members: GroupMember[];
  loading?: boolean;
  error?: Error | null;
  onMembersClick: () => void;
  className?: string;
}

export function CircleMembersBar({
  circle,
  members,
  loading = false,
  error = null,
  onMembersClick,
  className,
}: CircleMembersBarProps) {
  // Calculate visible avatars (4 on mobile, 5 on desktop)
  const maxAvatars = 5;
  const visibleMembers = members.slice(0, maxAvatars);
  const remainingCount = Math.max(0, members.length - maxAvatars);

  // Determine if members are active (mock for now)
  const isActive = useMemo(() => {
    // TODO: Implement with feed data - check if any member posted in last 24h
    // For now, return false
    return false;
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={cn("bg-white border-b border-neutral-200", className)}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 md:py-4">
          <div className="flex items-center gap-3">
            {/* Skeleton avatars */}
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="size-8 sm:size-9 md:size-10 rounded-full bg-neutral-200 animate-pulse border-2 border-white ring-1 ring-neutral-200"
                />
              ))}
            </div>
            {/* Skeleton text */}
            <div className="h-5 w-32 bg-neutral-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error state - show simple fallback
  if (error || members.length === 0) {
    return null; // Hide the bar if there's an error or no members
  }

  return (
    <button
      onClick={onMembersClick}
      className={cn(
        "w-full bg-white border-b border-neutral-200",
        "hover:bg-neutral-50 active:bg-neutral-100",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset",
        className
      )}
      aria-label={`View all ${members.length} members of ${circle.name}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-3 sm:py-3.5 md:py-4">
          {/* Left: Avatar Stack + Active Status */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Avatar Stack */}
            <div className="flex -space-x-3" role="list" aria-label="Member avatars">
              {visibleMembers.map((member, index) => {
                const avatarUrl = member.account.metadata?.picture?.optimized?.uri;
                const name = member.account.metadata?.name || member.account.username?.localName || `Member ${index + 1}`;
                const initials = getInitials(name);

                return (
                  <div
                    key={member.account.address}
                    role="listitem"
                    aria-label={name}
                    className="relative"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="size-8 sm:size-9 md:size-10 rounded-full border-2 border-white ring-1 ring-neutral-200 object-cover transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="size-8 sm:size-9 md:size-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-white ring-1 ring-neutral-200 flex items-center justify-center text-white text-xs font-bold transition-transform duration-200 hover:scale-105">
                        {initials}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* +X More Indicator */}
              {remainingCount > 0 && (
                <div className="size-8 sm:size-9 md:size-10 rounded-full bg-neutral-200 border-2 border-white ring-1 ring-neutral-300 flex items-center justify-center text-neutral-700 text-xs font-semibold -ml-3">
                  +{remainingCount}
                </div>
              )}
            </div>

            {/* Active Status Indicator */}
            {isActive && (
              <>
                {/* Mobile: Dot only */}
                <div
                  className="md:hidden size-2.5 rounded-full bg-success-500 border border-success-300 animate-pulse"
                  aria-label="Members are active"
                />

                {/* Desktop: Badge */}
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-success-50 border border-success-200 rounded-full">
                  <div className="size-2 rounded-full bg-success-500 animate-pulse" />
                  <span className="text-xs font-medium text-success-700">Active now</span>
                </div>
              </>
            )}
          </div>

          {/* Center: Member Count Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate sm:text-left">
              {members.length} {members.length === 1 ? "friend" : "friends"} saving together
            </p>
          </div>

          {/* Right: Chevron */}
          <ChevronRight className="size-5 text-neutral-400 flex-shrink-0" />
        </div>
      </div>
    </button>
  );
}

// Helper function to get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
