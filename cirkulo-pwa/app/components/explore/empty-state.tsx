import { Button } from "app/components/ui/button";
import { Search, Inbox, PlusCircle } from "lucide-react";

export interface EmptyStateProps {
  type?: "no-results" | "no-category" | "no-circles";
  searchQuery?: string;
  onClearSearch?: () => void;
  onViewAll?: () => void;
  onCreateCircle?: () => void;
}

export function EmptyState({
  type = "no-results",
  searchQuery,
  onClearSearch,
  onViewAll,
  onCreateCircle,
}: EmptyStateProps) {
  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="size-24 rounded-full bg-primary-100 flex items-center justify-center mb-6">
          <Search className="size-12 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">No circles found</h3>
        <p className="text-neutral-600 mb-6 max-w-md">
          We couldn't find any circles matching "{searchQuery}". Try different keywords
          or explore our categories.
        </p>
        <div className="flex gap-3">
          {onClearSearch && (
            <Button variant="outline" onClick={onClearSearch}>
              Clear search
            </Button>
          )}
          {onViewAll && (
            <Button onClick={onViewAll}>View all circles</Button>
          )}
        </div>
      </div>
    );
  }

  if (type === "no-category") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="size-24 rounded-full bg-secondary-100 flex items-center justify-center mb-6">
          <Inbox className="size-12 text-secondary-600" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          No circles yet in this category
        </h3>
        <p className="text-neutral-600 mb-6 max-w-md">
          Be the first to create a circle in this category! Your friends might be
          waiting for someone to start.
        </p>
        {onCreateCircle && (
          <Button onClick={onCreateCircle}>
            <PlusCircle className="size-4" />
            Create First Circle
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="size-24 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
        <Inbox className="size-12 text-neutral-600" />
      </div>
      <h3 className="text-2xl font-bold text-neutral-900 mb-2">No public circles yet</h3>
      <p className="text-neutral-600 mb-6 max-w-md">
        Be the first to create a public circle and start saving together!
      </p>
      {onCreateCircle && (
        <Button onClick={onCreateCircle}>
          <PlusCircle className="size-4" />
          Create Circle
        </Button>
      )}
    </div>
  );
}
