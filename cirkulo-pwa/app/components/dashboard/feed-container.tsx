import * as React from "react";
import { Button } from "app/components/ui/button";
import { Filter, ChevronDown } from "lucide-react";
import { ContributionItem } from "./feed-items/contribution-item";
import { MilestoneItem } from "./feed-items/milestone-item";
import { MemberJoinedItem } from "./feed-items/member-joined-item";
import { GoalCompletedItem } from "./feed-items/goal-completed-item";
import { CelebrationItem } from "./feed-items/celebration-item";
import type { FeedItem, FeedFilter } from "app/types/feed";

export interface FeedContainerProps {
  items: FeedItem[];
  filter?: FeedFilter;
  onFilterChange?: (filter: FeedFilter) => void;
  onLike?: (itemId: string) => void;
  onComment?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
}

const filterLabels: Record<FeedFilter, string> = {
  all: "All Activity",
  contributions: "Contributions",
  milestones: "Milestones",
  social: "Social Posts",
  "my-circles": "My Circles",
};

export function FeedContainer({
  items,
  filter = "all",
  onFilterChange,
  onLike,
  onComment,
  onShare,
}: FeedContainerProps) {
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);

  const handleFilterClick = (newFilter: FeedFilter) => {
    onFilterChange?.(newFilter);
    setShowFilterMenu(false);
  };

  const renderFeedItem = (item: FeedItem) => {
    const commonProps = {
      onLike: () => onLike?.(item.id),
      onComment: () => onComment?.(item.id),
      onShare: () => onShare?.(item.id),
    };

    switch (item.type) {
      case "contribution":
        return <ContributionItem key={item.id} item={item} {...commonProps} />;
      case "milestone":
        return <MilestoneItem key={item.id} item={item} {...commonProps} />;
      case "member-joined":
        return <MemberJoinedItem key={item.id} item={item} {...commonProps} />;
      case "goal-completed":
        return <GoalCompletedItem key={item.id} item={item} {...commonProps} />;
      case "celebration":
        return <CelebrationItem key={item.id} item={item} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 min-w-0 space-y-4" role="main" aria-label="Activity feed">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Activity Feed</h1>

        {/* Filter Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            aria-expanded={showFilterMenu}
            aria-haspopup="true"
            aria-label="Filter activity feed"
          >
            <Filter className="size-4" />
            {filterLabels[filter]}
            <ChevronDown className="size-4" />
          </Button>

          {showFilterMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowFilterMenu(false)}
                aria-hidden="true"
              />

              {/* Dropdown Menu */}
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-neutral-200 py-1 z-50"
                role="menu"
              >
                {(Object.keys(filterLabels) as FeedFilter[]).map((filterKey) => (
                  <button
                    key={filterKey}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                    onClick={() => handleFilterClick(filterKey)}
                    role="menuitem"
                  >
                    {filterLabels[filterKey]}
                    {filter === filterKey && (
                      <span className="ml-2 text-primary-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map(renderFeedItem)
        ) : (
          <div className="text-center py-16 px-4">
            <p className="text-neutral-600">No activity to display</p>
            <p className="text-sm text-neutral-500 mt-1">
              Join or create a circle to start seeing activities
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
