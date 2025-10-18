import * as React from "react";
import type { FeedItem } from "app/types/feed";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import { ActivityFeedItem } from "./activity-feed-item";
import { cn } from "app/lib/utils";

export type ActivityFilter = "all" | "contributions" | "milestones" | "social";

export interface CircleActivityFeedProps {
  items: FeedItem[];
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  className?: string;
}

export function CircleActivityFeed({
  items,
  onLike,
  onComment,
  className,
}: CircleActivityFeedProps) {
  const [filter, setFilter] = React.useState<ActivityFilter>("all");

  // Filter items based on selected filter
  const filteredItems = React.useMemo(() => {
    if (filter === "all") return items;
    if (filter === "contributions") {
      return items.filter((item) => item.type === "contribution");
    }
    if (filter === "milestones") {
      return items.filter(
        (item) => item.type === "milestone" || item.type === "goal-completed"
      );
    }
    if (filter === "social") {
      return items.filter(
        (item) =>
          item.type === "celebration" ||
          item.type === "comment" ||
          item.type === "member-joined"
      );
    }
    return items;
  }, [items, filter]);

  const filters: { value: ActivityFilter; label: string }[] = [
    { value: "all", label: "All Activity" },
    { value: "contributions", label: "Contributions" },
    { value: "milestones", label: "Milestones" },
    { value: "social", label: "Social" },
  ];

  return (
    <Card className={cn("bg-white/90 backdrop-blur-sm border-0 shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Activity Feed</CardTitle>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pt-4 pb-2 -mb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                filter === f.value
                  ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center px-4">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No activity yet
            </h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              {filter === "all"
                ? "Be the first to contribute and get the circle started!"
                : `No ${filter} to show yet. Check back soon!`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredItems.map((item, index) => (
              <ActivityFeedItem
                key={item.id}
                item={item}
                onLike={onLike}
                onComment={onComment}
                className={cn(
                  index === 0 && "pt-0",
                  index === filteredItems.length - 1 && "pb-0"
                )}
              />
            ))}
          </div>
        )}

        {/* Load More Button (placeholder for pagination) */}
        {filteredItems.length > 0 && filteredItems.length >= 10 && (
          <div className="mt-4 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log("Load more")}
              className="w-full text-primary-600 hover:text-primary-700"
            >
              Load More Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
