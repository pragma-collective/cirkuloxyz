import { useState } from "react";
import type { Circle } from "app/types/feed";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Button } from "app/components/ui/button";
import { UserPlus, Crown } from "lucide-react";
import { cn } from "app/lib/utils";

export interface CircleMembersProps {
  circle: Circle;
  onInvite: () => void;
  onMemberClick?: (userId: string) => void;
  className?: string;
}

export function CircleMembers({
  circle,
  onInvite,
  onMemberClick,
  className,
}: CircleMembersProps) {
  const [showAll, setShowAll] = useState(false);

  // Determine how many members to show
  const visibleMembers = showAll ? circle.members : circle.members.slice(0, 12);
  const hasMore = circle.members.length > 12;

  // Mock: Randomly select a top contributor (would come from API in production)
  const topContributorId = circle.members[0]?.id;

  return (
    <Card className={cn("bg-white/90 backdrop-blur-sm border-0 shadow-lg", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl sm:text-2xl">
            Members ({circle.memberCount})
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={onInvite}
            className="gap-2"
          >
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Members List */}
        <div className="space-y-2">
          {visibleMembers.map((member, index) => {
            const isActive = index < 3; // Mock: first 3 members are "active now"

            return (
              <button
                key={member.id}
                onClick={onMemberClick ? () => onMemberClick(member.id) : undefined}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:bg-neutral-100 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={member}
                      size="md"
                      className="size-10"
                    />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-neutral-900 truncate max-w-[180px] sm:max-w-[240px]">
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-600">
                        @{member.lensUsername || member.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="size-2 bg-success-500 rounded-full pulse-dot" />
                      <span className="text-xs text-success-600 font-medium hidden sm:inline">Active</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Show More/Less Buttons */}
        {hasMore && (
          <div className="pt-1">
            {!showAll ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
                className="w-full text-primary-600 hover:text-primary-700"
              >
                View All {circle.memberCount} Members
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(false)}
                className="w-full text-primary-600 hover:text-primary-700"
              >
                Show Less
              </Button>
            )}
          </div>
        )}

        {/* Invite Friends CTA */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4 border-2 border-primary-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">👥</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">
                Grow the circle
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                Invite friends to save together
              </p>
            </div>
            <Button
              size="sm"
              onClick={onInvite}
              className="gap-2 bg-gradient-to-r from-primary-500 to-secondary-500"
            >
              <UserPlus className="size-4" />
              Invite
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
