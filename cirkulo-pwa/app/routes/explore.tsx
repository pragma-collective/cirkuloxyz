import { useState, useMemo } from "react";
import type { Route } from "./+types/explore";
import { useNavigate } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { ExploreHeader } from "app/components/explore/explore-header";
import { CategoryFilter } from "app/components/explore/category-filter";
import { CircleCard } from "app/components/explore/circle-card";
import { EmptyState } from "app/components/explore/empty-state";
import { CreateCircleCTA } from "app/components/explore/create-circle-cta";
import { mockPublicCircles } from "app/lib/mock-data";
import type { Circle, CircleCategory } from "app/types/feed";
import { Home, Compass, PlusCircle, Bell, User } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CircleCategory | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState("popular");

  // Filter and sort circles
  const filteredCircles = useMemo(() => {
    let circles = [...mockPublicCircles];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      circles = circles.filter(
        (circle) =>
          circle.name.toLowerCase().includes(query) ||
          circle.goalName.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (activeCategory !== "all") {
      circles = circles.filter((circle) => circle.category === activeCategory);
    }

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
  }, [searchQuery, activeCategory, sortBy]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: mockPublicCircles.length,
    };

    mockPublicCircles.forEach((circle) => {
      if (circle.category) {
        counts[circle.category] = (counts[circle.category] || 0) + 1;
      }
    });

    return counts;
  }, []);

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

  const handleCircleClick = (circleId: string) => {
    navigate(`/circle/${circleId}`);
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
      onProfileClick={() => console.log("Profile clicked")}
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
          icon: <Bell className="size-6" />,
          label: "Alerts",
          badge: 0,
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
              <CircleCard
                key={circle.id}
                circle={circle}
                badge={getBadge(circle)}
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

        {/* Create Circle CTA */}
        {filteredCircles.length > 0 && (
          <CreateCircleCTA onClick={handleCreateCircle} />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
