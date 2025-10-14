import * as React from "react";
import { Button } from "app/components/ui/button";
import { Search, Filter, ChevronDown } from "lucide-react";

export interface ExploreHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "nearly-complete", label: "Nearly Complete" },
  { value: "amount-low", label: "Goal Amount (Low to High)" },
  { value: "amount-high", label: "Goal Amount (High to Low)" },
];

export function ExploreHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: ExploreHeaderProps) {
  const [showSortMenu, setShowSortMenu] = React.useState(false);

  const selectedSort = sortOptions.find((opt) => opt.value === sortBy);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search circles by name or goal..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-neutral-200
                       focus:border-primary-500 focus:ring-[3px] focus:ring-primary-500/30
                       transition-all outline-none text-neutral-900 placeholder:text-neutral-400"
            aria-label="Search circles"
            role="search"
          />
        </div>

        {/* Desktop: Sort */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowSortMenu(!showSortMenu)}
              aria-expanded={showSortMenu}
              aria-haspopup="true"
              aria-label="Sort options"
            >
              <Filter className="size-4" />
              {selectedSort?.label}
              <ChevronDown className="size-4" />
            </Button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSortMenu(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-neutral-200 py-1 z-50"
                  role="menu"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                      onClick={() => {
                        onSortChange(option.value);
                        setShowSortMenu(false);
                      }}
                      role="menuitem"
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <span className="ml-2 text-primary-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
