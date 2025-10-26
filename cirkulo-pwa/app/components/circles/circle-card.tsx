import { useNavigate } from "react-router";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { DollarSign, MessageCircle, Share2 } from "lucide-react";
import type { EnrichedCircle } from "app/hooks/use-fetch-my-circles";

interface CircleCardProps {
  circle: EnrichedCircle;
}

/**
 * Helper function to get circle emoji based on type
 */
function getCircleEmoji(circleType: string): string {
  const emojiMap: Record<string, string> = {
    contribution: "💰",
    rotating: "🔄",
    fundraising: "🎯",
  };
  return emojiMap[circleType] || "🔵";
}

/**
 * Circle card component for displaying individual circles
 * 
 * REAL DATA USED:
 * - Member avatars from Lens Protocol (circle.members)
 * - Member count (circle.members.length)
 * 
 * MOCK DATA USED:
 * - Progress bar (35% with $3,500 / $10,000)
 * - Latest activity
 * - Contribution schedule
 * 
 * TODO: Replace remaining mock data with real data from:
 * - Pool contract reads (on-chain)
 * - Activity feed API
 */
export function CircleCard({ circle }: CircleCardProps) {
  const navigate = useNavigate();

  // Format timestamp for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Format currency (for mock data)
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get emoji for circle type
  const emoji = getCircleEmoji(circle.circleType);

  // REAL DATA - Members from API
  const members = circle.members || [];
  const memberCount = members.length;
  const displayMembers = members.slice(0, 5); // Show max 5 avatars
  const remainingMembersCount = Math.max(0, memberCount - 5);

  // MOCK DATA - To be replaced with real data from APIs
  const mockCurrentAmount = 3500;
  const mockGoalAmount = 10000;
  const mockProgress = Math.round((mockCurrentAmount / mockGoalAmount) * 100);
  const mockContributionSchedule = "weekly" as const;

  return (
    <Card
      className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={() => navigate(`/circle/${circle.lensGroupAddress}`)}
    >
      <CardHeader className="space-y-4 pb-4">
        {/* Circle Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl group-hover:scale-110 transition-transform">
              {emoji}
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
                {circle.circleName}
              </CardTitle>
              <p className="text-xs text-neutral-600 mt-1">
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
        </div>

        {/* Member Avatar Row - REAL DATA */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {displayMembers.map((member, idx) => (
                <div
                  key={member.address}
                  className="size-8 rounded-full ring-2 ring-white overflow-hidden bg-neutral-200 flex items-center justify-center"
                  title={member.username || member.address}
                >
                  {member.metadata?.picture ? (
                    <img
                      src={member.metadata.picture}
                      alt={member.username || member.address}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-linear-to-br from-primary-400 to-secondary-500 text-white text-xs font-semibold">
                      {member.username
                        ? member.username.charAt(1).toUpperCase()
                        : member.address.slice(2, 4).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
              {remainingMembersCount > 0 && (
                <div className="size-8 rounded-full bg-neutral-200 ring-2 ring-white flex items-center justify-center text-xs font-medium text-neutral-700">
                  +{remainingMembersCount}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-success-500 rounded-full pulse-dot" />
              <span className="text-xs text-neutral-600">Active now</span>
            </div>
          </div>
          {memberCount > 1 && (
            <p className="text-xs text-neutral-500">
              {Math.min(memberCount, 5)} {memberCount === 1 ? "friend" : "friends"} saving together
            </p>
          )}
        </div>

        {/* Progress Bar with Shimmer - MOCKED */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-neutral-900">
              {formatCurrency(mockCurrentAmount)}
            </span>
            <span className="text-neutral-600">
              of {formatCurrency(mockGoalAmount)}
            </span>
          </div>
          <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500 shimmer-effect overflow-hidden"
              style={{ width: `${Math.min(mockProgress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-primary-600">
              {mockProgress}% complete
            </span>
            <span className="text-neutral-500 capitalize">
              {mockContributionSchedule}
            </span>
          </div>
        </div>

        {/* Latest Activity - MOCKED (TODO: Use real activity data) */}
        {members.length > 0 && (
          <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              {/* Member avatar */}
              <div
                className="size-6 rounded-full ring-2 ring-white overflow-hidden bg-neutral-200 flex items-center justify-center shrink-0"
                title={members[0].username || members[0].address}
              >
                {members[0].metadata?.picture ? (
                  <img
                    src={members[0].metadata.picture}
                    alt={members[0].username || members[0].address}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center bg-linear-to-br from-primary-400 to-secondary-500 text-white text-[10px] font-semibold">
                    {members[0].username
                      ? members[0].username.charAt(1).toUpperCase()
                      : members[0].address.slice(2, 4).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-900">
                  <span className="font-semibold">
                    {members[0].username || `${members[0].address.slice(0, 6)}...${members[0].address.slice(-4)}`}
                  </span>
                  {" "}contributed
                </p>
              </div>
              <span className="text-xs font-semibold text-success-600">
                +$150
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              2h ago
            </p>
          </div>
        )}
      </CardHeader>

      {/* Quick Actions */}
      <CardContent className="pt-0 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Contribute clicked:", circle.id);
            }}
            className="text-xs gap-1.5"
          >
            <DollarSign className="size-3.5" />
            Contribute
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Chat clicked:", circle.id);
            }}
            className="text-xs gap-1.5"
          >
            <MessageCircle className="size-3.5" />
            Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Share clicked:", circle.id);
            }}
            className="text-xs gap-1.5"
          >
            <Share2 className="size-3.5" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
