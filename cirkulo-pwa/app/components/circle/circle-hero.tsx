import * as React from "react";
import type { Circle } from "app/types/feed";
import { Button } from "app/components/ui/button";
import { Card } from "app/components/ui/card";
import {
  DollarSign,
  Users,
  Calendar,
  Share2,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { cn } from "app/lib/utils";

export interface CircleHeroProps {
  circle: Circle;
  onContribute: () => void;
  onInvite: () => void;
  onShare: () => void;
  onJoin?: () => void;
  isMember?: boolean;
}

export function CircleHero({
  circle,
  onContribute,
  onInvite,
  onShare,
  onJoin,
  isMember = true,
}: CircleHeroProps) {
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate days left
  const daysLeft = React.useMemo(() => {
    const now = new Date();
    const end = new Date(circle.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [circle.endDate]);

  return (
    <div className="relative">
      {/* Gradient Banner */}
      <div className="relative h-[200px] sm:h-[280px] bg-gradient-to-br from-primary-400 via-secondary-400 to-primary-500 overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-12 w-32 h-32 rounded-full border-4 border-white/40" />
          <div className="absolute top-16 right-16 w-24 h-24 rounded-full border-4 border-white/30" />
          <div className="absolute bottom-12 left-1/3 w-20 h-20 rounded-full border-4 border-white/25" />
          <div className="absolute top-24 left-1/4 w-16 h-16 rounded-full bg-white/20" />
          <div className="absolute bottom-16 right-1/4 w-28 h-28 rounded-full bg-white/15" />
        </div>

        {/* Public/Private Badge */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {circle.isPublic ? "Public Circle" : "Private Circle"}
          </div>
        </div>
      </div>

      {/* Hero Content Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Circle Emoji - Overlaps Banner */}
          <div className="relative -mt-16 sm:-mt-20 mb-4 sm:mb-6 flex justify-center sm:justify-start">
            <div className="relative">
              {/* Pulsing Ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-75 pulse-ring" />

              {/* Emoji Container */}
              <div className="relative bg-white rounded-full p-4 shadow-2xl">
                <div className="text-6xl sm:text-8xl leading-none">
                  {circle.emoji || "🎯"}
                </div>
              </div>
            </div>
          </div>

          {/* Circle Info */}
          <div className="text-center sm:text-left mb-6 space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
              {circle.name}
            </h1>

            {circle.description && (
              <p className="text-base sm:text-lg text-neutral-700 max-w-3xl">
                {circle.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1.5">
                <Users className="size-4" />
                <span>{circle.memberCount} {circle.memberCount === 1 ? "member" : "members"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span className="capitalize">{circle.contributionSchedule} contributions</span>
              </div>
              {circle.category && (
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-1 bg-neutral-100 rounded-full text-xs font-medium capitalize">
                    {circle.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* Progress */}
            <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg">
                  <TrendingUp className="size-4 sm:size-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-600 mb-1">Progress</p>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {circle.progress}%
                  </p>
                </div>
              </div>
            </Card>

            {/* Amount Saved */}
            <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-success-400 to-success-600 rounded-lg">
                  <DollarSign className="size-4 sm:size-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-600 mb-1">Saved</p>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {formatCurrency(circle.currentAmount)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Goal */}
            <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-lg">
                  <TrendingUp className="size-4 sm:size-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-600 mb-1">Goal</p>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {formatCurrency(circle.goalAmount)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Days Left */}
            <Card className="p-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-warning-400 to-warning-600 rounded-lg">
                  <Calendar className="size-4 sm:size-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-600 mb-1">Days Left</p>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {daysLeft}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            {isMember ? (
              <>
                {/* Primary Action - Contribute Now */}
                <Button
                  size="lg"
                  onClick={onContribute}
                  className="w-full sm:w-auto gap-2 px-6 sm:px-8 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg"
                >
                  <DollarSign className="size-5" />
                  Contribute Now
                </Button>

                {/* Secondary Actions - Grouped Horizontally on Mobile */}
                <div className="flex gap-2.5 sm:contents">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onInvite}
                    className="flex-1 sm:flex-initial gap-2 px-4 sm:px-8"
                  >
                    <UserPlus className="size-5" />
                    Invite Friends
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onShare}
                    className="flex-1 sm:flex-initial gap-2 px-4 sm:px-8 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400"
                  >
                    <Share2 className="size-5" />
                    Share
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Non-Member: Join/Request + Share */}
                <Button
                  size="lg"
                  onClick={onJoin}
                  className="w-full sm:w-auto gap-2 px-6 sm:px-8 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg"
                >
                  <UserPlus className="size-5" />
                  {circle.isPublic ? "Join Circle" : "Request to Join"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onShare}
                  className="w-full sm:w-auto gap-2 px-6 sm:px-8"
                >
                  <Share2 className="size-5" />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
