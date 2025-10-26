import { cn } from "app/lib/utils";
import type { CircleCategory } from "app/types/feed";

export interface CategoryFilterProps {
  activeCategory: CircleCategory | "all" | "my-circles";
  onCategoryChange: (category: CircleCategory | "all" | "my-circles") => void;
  categoryCounts?: Record<string, number>;
}

const categories = [
  { value: "all" as const, label: "All Circles", emoji: undefined },
  { value: "my-circles" as const, label: "My Circles", emoji: "👤" },
  { value: "vacation" as const, label: "Vacation & Travel", emoji: "✈️" },
  { value: "home" as const, label: "Home & Real Estate", emoji: "🏠" },
  { value: "technology" as const, label: "Technology", emoji: "💻" },
  { value: "education" as const, label: "Education", emoji: "📚" },
  { value: "events" as const, label: "Events", emoji: "🎉" },
  { value: "other" as const, label: "Other", emoji: undefined },
];

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
  categoryCounts = {},
}: CategoryFilterProps) {
  return (
    <div className="border-b border-neutral-200 bg-white sticky top-[72px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:flex-wrap">
          {categories.map((category) => {
            const count = categoryCounts[category.value] || 0;
            const isActive = activeCategory === category.value;

            return (
              <button
                key={category.value}
                onClick={() => onCategoryChange(category.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap",
                  "border-2 transition-all duration-200 snap-start",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
                  isActive
                    ? "bg-primary-600 text-white border-primary-600 shadow-md"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                )}
                aria-pressed={isActive}
                aria-label={`Filter by ${category.label}`}
              >
                {category.emoji && (
                  <span className="text-base" role="img" aria-label={category.label}>
                    {category.emoji}
                  </span>
                )}
                <span className="font-medium text-sm">{category.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
