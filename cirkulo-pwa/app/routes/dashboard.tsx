import { useState, useCallback, useMemo } from "react";
import type { Route } from "./+types/dashboard";
import { useNavigate } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { LeftSidebar } from "app/components/dashboard/left-sidebar";
import { RightSidebar } from "app/components/dashboard/right-sidebar";
import { FeedContainer } from "app/components/dashboard/feed-container";
import { mockUserStats, mockCircles, mockFeedItems } from "app/lib/mock-data";
import type { FeedFilter } from "app/types/feed";
import { Home, Compass, PlusCircle, Bell, User } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Xersha" },
    {
      name: "description",
      content: "Your Xersha dashboard - track savings, view activity, and manage your circles",
    },
  ];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [feedItems, setFeedItems] = useState(mockFeedItems);

  // Handle like action
  const handleLike = useCallback((itemId: string) => {
    setFeedItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              isLiked: !item.isLiked,
              likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1,
            }
          : item
      )
    );
  }, []);

  // Handle comment action (placeholder)
  const handleComment = useCallback((itemId: string) => {
    console.log("Comment on item:", itemId);
    // TODO: Implement comment functionality
  }, []);

  // Handle share action (placeholder)
  const handleShare = useCallback((itemId: string) => {
    console.log("Share item:", itemId);
    // TODO: Implement share functionality
  }, []);

  // Filter feed items based on selected filter
  const filteredItems = useMemo(() => {
    if (feedFilter === "all") return feedItems;
    if (feedFilter === "contributions") {
      return feedItems.filter((item) => item.type === "contribution");
    }
    if (feedFilter === "milestones") {
      return feedItems.filter(
        (item) => item.type === "milestone" || item.type === "goal-completed"
      );
    }
    if (feedFilter === "social") {
      return feedItems.filter(
        (item) => item.type === "celebration" || item.type === "comment"
      );
    }
    return feedItems; // my-circles - TODO: implement circle filtering
  }, [feedItems, feedFilter]);

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
          active: true,
          to: "/dashboard",
        },
        {
          icon: <Compass className="size-6" />,
          label: "Explore",
          to: "/explore",
        },
        {
          icon: <PlusCircle className="size-6" />,
          label: "Create",
          onClick: () => navigate("/create-circle"),
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
      {/* Dashboard Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px] gap-6">
          {/* Left Sidebar - Hidden on mobile/tablet, visible on desktop */}
          <LeftSidebar
            stats={mockUserStats}
            onNewContribution={() => console.log("New contribution")}
            onCreateCircle={() => navigate("/create-circle")}
            onSettings={() => console.log("Settings")}
          />

          {/* Main Feed */}
          <FeedContainer
            items={filteredItems}
            filter={feedFilter}
            onFilterChange={setFeedFilter}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />

          {/* Right Sidebar - Hidden on mobile/tablet/small desktop, visible on XL */}
          <RightSidebar
            circles={mockCircles}
            onCircleClick={(circleId) => navigate(`/circle/${circleId}`)}
            onCreateCircle={() => navigate("/create-circle")}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
