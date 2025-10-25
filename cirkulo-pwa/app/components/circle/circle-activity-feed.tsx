import type { FeedItem } from "app/types/feed";
import { Button } from "app/components/ui/button";
import { ActivityFeedItem } from "./activity-feed-item";
import { cn } from "app/lib/utils";

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
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Section */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 sm:top-20 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Activity Feed</h2>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="bg-white">
        {items.length === 0 ? (
          <div className="py-12 text-center px-4">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No activity yet
            </h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Be the first to share an update or contribute to get the circle started!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {items.map((item) => (
              <ActivityFeedItem
                key={item.id}
                item={item}
                onLike={onLike}
                onComment={onComment}
              />
            ))}
          </div>
        )}

        {/* Load More Button (placeholder for pagination) */}
        {items.length > 0 && items.length >= 10 && (
          <div className="py-4 px-4 sm:px-6 lg:px-8">
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

        {/* Bottom Padding for FAB */}
        <div className="h-24 sm:h-16" />
      </div>
    </div>
  );
}
