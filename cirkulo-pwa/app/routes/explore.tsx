import { useState, useMemo } from "react";
import type { Route } from "./+types/explore";
import { useNavigate } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { ExploreHeader } from "app/components/explore/explore-header";
import { CategoryFilter } from "app/components/explore/category-filter";
import { EnrichedCircleCard } from "app/components/explore/enriched-circle-card";
import { EmptyState } from "app/components/explore/empty-state";
import { CreateCircleCTA } from "app/components/explore/create-circle-cta";
import { useEnrichedCircles } from "app/hooks/use-enriched-circles";
import { useAuth } from "app/context/auth-context";
import type { Circle, CircleCategory } from "app/types/feed";
import { Home, Compass, PlusCircle, Wallet, User } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Explore Circles - Xersha" },
    {
      name: "description",
      content: "Discover and join public savings circles on Xersha",
    },
  ];
}

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CircleCategory | "all" | "my-circles">(
    "all"
  );
  const [sortBy, setSortBy] = useState("popular");

  // Determine if showing "My Circles" or "Explore"
  const showMyCircles = activeCategory === "my-circles";

  // Fetch enriched circles from API + Lens + Contract data
  // If "My Circles": Show only circles user is a member of (onlyUser)
  // If "Explore": Exclude circles user is already a member of (excludeUser)
  const { circles: enrichedCircles, isLoading, error } = useEnrichedCircles({
    category: activeCategory !== "all" && activeCategory !== "my-circles" ? activeCategory : undefined,
    onlyUser: showMyCircles ? user?.lensAccount?.address : undefined,
    excludeUser: showMyCircles ? undefined : user?.lensAccount?.address,
  });

  // Filter and sort circles
  const filteredCircles = useMemo(() => {
    let circles = [...enrichedCircles];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      circles = circles.filter(
        (circle) =>
          circle.name.toLowerCase().includes(query) ||
          circle.goalName.toLowerCase().includes(query)
      );
    }

    // Note: Category filtering is already handled by the backend API
    // We don't need to filter by category again here

    // Sort circles
    switch (sortBy) {
      case "popular":
        circles.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case "newest":
        circles.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "nearly-complete":
        circles.sort((a, b) => b.progress - a.progress);
        break;
      case "amount-low":
        circles.sort((a, b) => a.goalAmount - b.goalAmount);
        break;
      case "amount-high":
        circles.sort((a, b) => b.goalAmount - a.goalAmount);
        break;
    }

    return circles;
  }, [searchQuery, sortBy, enrichedCircles]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: enrichedCircles.length,
    };

    enrichedCircles.forEach((circle) => {
      if (circle.categories) {
        circle.categories.forEach((cat) => {
          counts[cat] = (counts[cat] || 0) + 1;
        });
      }
    });

    return counts;
  }, [enrichedCircles]);

  // Get badge for circles
  const getBadge = (circle: Circle): "trending" | "new" | "nearly-complete" | undefined => {
    if (circle.progress >= 90) return "nearly-complete";
    if (circle.memberCount >= 8) return "trending";

    const daysSinceCreated = circle.createdAt
      ? (Date.now() - new Date(circle.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    if (daysSinceCreated <= 14) return "new";

    return undefined;
  };

  // Handlers
  const handleJoinCircle = (circleId: string) => {
    console.log("Join circle:", circleId);
    // TODO: Implement join circle functionality
  };

  const handleShareCircle = (circleId: string) => {
    console.log("Share circle:", circleId);
    // TODO: Implement share functionality
  };

  const handleCircleClick = (lensGroupAddress: string) => {
    navigate(`/circle/${lensGroupAddress}`);
  };

  const handleCreateCircle = () => {
    navigate("/create-circle");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleViewAll = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  return (
    <AuthenticatedLayout
      notificationCount={3}
      onNotificationClick={() => console.log("Notifications clicked")}
      onProfileClick={() => navigate("/profile")}
      onNewContribution={() => console.log("New contribution clicked")}
      navItems={[
        {
          icon: <Home className="size-6" />,
          label: "Home",
          active: false,
          to: "/dashboard",
        },
        {
          icon: <Compass className="size-6" />,
          label: "Explore",
          active: true,
          to: "/explore",
        },
        {
          icon: <PlusCircle className="size-6" />,
          label: "Create",
          onClick: handleCreateCircle,
        },
        {
          icon: <Wallet className="size-6" />,
          label: "Wallet",
          to: "/wallet",
        },
        {
          icon: <User className="size-6" />,
          label: "Profile",
          onClick: () => navigate("/profile"),
        },
      ]}
    >
      {/* Explore Header */}
      <ExploreHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Category Filter */}
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categoryCounts={categoryCounts}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-2 border-neutral-200 rounded-3xl p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-2xl bg-neutral-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-neutral-200 rounded w-3/4" />
                    <div className="h-4 bg-neutral-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-6 bg-neutral-200 rounded w-1/2" />
                  <div className="h-2.5 bg-neutral-100 rounded-full" />
                  <div className="h-4 bg-neutral-200 rounded w-1/4" />
                </div>
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
                <div className="h-10 bg-neutral-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Result count */}
            {searchQuery && (
              <p className="text-sm text-neutral-600 mb-4" role="status" aria-live="polite">
                Found {filteredCircles.length} circles
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            )}

            {/* Circles Grid */}
            {filteredCircles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredCircles.map((circle) => (
                  <EnrichedCircleCard
                    key={circle.id}
                    circle={circle}
                    badge={getBadge(circle)}
                    isUserMember={showMyCircles}
                    onJoin={handleJoinCircle}
                    onShare={handleShareCircle}
                    onClick={handleCircleClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                type={searchQuery ? "no-results" : "no-category"}
                searchQuery={searchQuery}
                onClearSearch={handleClearSearch}
                onViewAll={handleViewAll}
                onCreateCircle={handleCreateCircle}
              />
            )}
          </>
        )}

        {/* Create Circle CTA */}
        {filteredCircles.length > 0 && (
          <CreateCircleCTA onClick={handleCreateCircle} />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
