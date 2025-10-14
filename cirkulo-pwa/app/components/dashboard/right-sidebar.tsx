import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import { Plus, Users } from "lucide-react";
import { cn } from "app/lib/utils";
import type { Circle } from "app/types/feed";

export interface RightSidebarProps {
  circles: Circle[];
  onCircleClick?: (circleId: string) => void;
  onCreateCircle?: () => void;
}

interface CircleListItemProps {
  circle: Circle;
  onClick?: () => void;
}

function CircleListItem({ circle, onClick }: CircleListItemProps) {
  return (
    <button
      className="w-full p-3 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
      onClick={onClick}
      aria-label={`View ${circle.name} circle, ${circle.progress}% complete`}
    >
      <div className="flex items-center gap-3">
        {/* Circle Icon */}
        <div className="size-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
          {circle.emoji || circle.name.charAt(0).toUpperCase()}
        </div>

        {/* Circle Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate mb-0.5">
            {circle.name}
          </p>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                style={{ width: `${circle.progress}%` }}
                role="progressbar"
                aria-valuenow={circle.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${circle.progress}% of goal reached`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600">
                ${circle.currentAmount.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-neutral-900">
                {circle.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Member Count Badge */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary-100 flex-shrink-0">
          <Users className="size-3 text-secondary-700" />
          <span className="text-xs font-semibold text-secondary-900">
            {circle.memberCount}
          </span>
        </div>
      </div>
    </button>
  );
}

export function RightSidebar({
  circles,
  onCircleClick,
  onCreateCircle,
}: RightSidebarProps) {
  return (
    <aside className="hidden xl:block xl:w-80 space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader className="!pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your Circles</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateCircle}
              aria-label="Create new circle"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="!pt-0 space-y-2">
          {circles.length > 0 ? (
            circles.map((circle) => (
              <CircleListItem
                key={circle.id}
                circle={circle}
                onClick={() => onCircleClick?.(circle.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-neutral-600 mb-3">
                You haven't joined any circles yet
              </p>
              <Button variant="outline" size="sm" onClick={onCreateCircle}>
                <Plus className="size-4" />
                Create Your First Circle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
