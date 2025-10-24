import { useMemo } from "react";
import type { Route } from "./+types/profile";
import { useNavigate } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
} from "app/components/ui/card";
import { CircleCard } from "app/components/circles/circle-card";
import {
  mockCurrentUser,
  mockUserStats,
  mockCircles,
  mockStreak,
  mockProfileActivity,
} from "app/lib/mock-data";
import {
  Home,
  Compass,
  PlusCircle,
  Bell,
  User,
  Edit3,
  Camera,
  Flame,
  Users,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "app/lib/utils";
import { useAuth } from "app/context/auth-context";
import { useFetchMyCircles } from "app/hooks/use-fetch-my-circles";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile - Xersha" },
    {
      name: "description",
      content: "View and manage your Xersha profile",
    },
  ];
}

export default function Profile() {
  const navigate = useNavigate();
  const { sessionClient } = useAuth();

  // Fetch user's circles from API
  const {
    data: circlesResponse,
    isLoading: isLoadingCircles,
    error: circlesError,
    refetch: refetchCircles,
  } = useFetchMyCircles(sessionClient);

  // Extract circles data
  const userCircles = circlesResponse?.data || [];

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Calculate friends count (unique users across all circles)
  const friendsCount = useMemo(() => {
    const uniqueUserIds = new Set<string>();
    mockCircles.forEach((circle) => {
      circle.members.forEach((member) => {
        if (member.id !== mockCurrentUser.id) {
          uniqueUserIds.add(member.id);
        }
      });
    });
    return uniqueUserIds.size;
  }, []);

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
          active: true,
        },
      ]}
    >
      {/* PHASE 1: HERO SECTION - Vibrant Social Profile */}
      <div className="relative">
        {/* Gradient Banner */}
        <div className="relative h-[180px] sm:h-[240px] bg-gradient-to-br from-primary-400 via-secondary-400 to-primary-500 overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-8 left-12 w-32 h-32 rounded-full border-4 border-white/40" />
            <div className="absolute top-16 right-16 w-24 h-24 rounded-full border-4 border-white/30" />
            <div className="absolute bottom-12 left-1/3 w-20 h-20 rounded-full border-4 border-white/25" />
            <div className="absolute top-24 left-1/4 w-16 h-16 rounded-full bg-white/20" />
            <div className="absolute bottom-16 right-1/4 w-28 h-28 rounded-full bg-white/15" />
          </div>

          {/* Edit Cover Button - Desktop */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log("Edit cover clicked")}
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 gap-2"
              aria-label="Edit cover photo"
            >
              <Camera className="size-4" />
              <span className="hidden sm:inline">Edit Cover</span>
            </Button>
          </div>
        </div>

        {/* Profile Content Container */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Avatar with Animated Ring - Overlaps Banner */}
            <div className="relative -mt-12 sm:-mt-16 mb-4 sm:mb-6 flex justify-center sm:justify-start">
              <div className="relative">
                {/* Pulsing Ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-75 pulse-ring" />

                {/* Avatar */}
                <div className="relative bg-white rounded-full p-1.5">
                  <UserAvatar
                    user={mockCurrentUser}
                    size="md"
                    className="size-24 sm:size-30 ring-4 ring-white"
                  />
                </div>

                {/* Streak Badge */}
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-warning-400 to-warning-600 text-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 text-sm font-bold">
                  <Flame className="size-4" />
                  <span>{mockStreak.currentDays}</span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center sm:text-left mb-6 relative">
              {/* Edit Profile Button - Mobile (Top Right) */}
              <div className="sm:hidden absolute top-0 right-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("Edit profile clicked")}
                  className="gap-2"
                  aria-label="Edit profile"
                >
                  <Edit3 className="size-4" />
                  Edit
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                      {mockCurrentUser.name}
                    </h1>
                    <p className="text-base sm:text-lg text-neutral-600 mt-1">
                      @{mockCurrentUser.lensUsername}
                    </p>
                  </div>

                  {/* Edit Profile Button - Desktop */}
                  <div className="hidden sm:block">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => console.log("Edit profile clicked")}
                      className="gap-2"
                      aria-label="Edit profile"
                    >
                      <Edit3 className="size-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>

                {mockCurrentUser.bio && (
                  <p className="text-sm sm:text-base text-neutral-700 max-w-2xl">
                    {mockCurrentUser.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Row - Instagram Style */}
            <div className="grid grid-cols-4 gap-4 py-6 border-b border-neutral-200">
              <button
                className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
                onClick={() => console.log("Active Circles clicked")}
                aria-label={`${mockUserStats.activeCircles} active circles`}
              >
                <span className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {mockUserStats.activeCircles}
                </span>
                <span className="text-xs sm:text-sm text-neutral-600">
                  Circles
                </span>
              </button>

              <button
                className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
                onClick={() => console.log("Total Saved clicked")}
                aria-label={`${formatCurrency(mockUserStats.totalSaved)} total saved`}
              >
                <span className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {formatCurrency(mockUserStats.totalSaved)}
                </span>
                <span className="text-xs sm:text-sm text-neutral-600">
                  Saved
                </span>
              </button>

              <button
                className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
                onClick={() => console.log("Goals Hit clicked")}
                aria-label={`${mockUserStats.goalsCompleted} goals completed`}
              >
                <span className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {mockUserStats.goalsCompleted}
                </span>
                <span className="text-xs sm:text-sm text-neutral-600">
                  Goals
                </span>
              </button>

              <button
                className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
                onClick={() => console.log("Friends clicked")}
                aria-label={`${friendsCount} friends`}
              >
                <span className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {friendsCount}
                </span>
                <span className="text-xs sm:text-sm text-neutral-600">
                  Friends
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* PHASE 2: ACHIEVEMENT CARDS - Colorful & Celebratory */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 px-1">
              Your Achievements
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Current Streak */}
              <div className="card-enter rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-warning-400 to-warning-600 text-white shadow-lg hover-scale cursor-pointer group">
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                    🔥
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {mockStreak.currentDays}
                    </p>
                    <p className="text-sm sm:text-base font-medium opacity-90 mt-1">
                      Day Streak
                    </p>
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    Keep it going!
                  </p>
                </div>
              </div>

              {/* Total Saved */}
              <div className="card-enter rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-success-400 to-success-600 text-white shadow-lg hover-scale cursor-pointer group">
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                    💰
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {formatCurrency(mockUserStats.totalSaved)}
                    </p>
                    <p className="text-sm sm:text-base font-medium opacity-90 mt-1">
                      Total Saved
                    </p>
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    Amazing progress!
                  </p>
                </div>
              </div>

              {/* Goals Hit */}
              <div className="card-enter rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg hover-scale cursor-pointer group">
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                    🏆
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {mockUserStats.goalsCompleted}
                    </p>
                    <p className="text-sm sm:text-base font-medium opacity-90 mt-1">
                      Goals Hit
                    </p>
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    You're crushing it!
                  </p>
                </div>
              </div>

              {/* Friends */}
              <div className="card-enter rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-secondary-400 to-secondary-600 text-white shadow-lg hover-scale cursor-pointer group">
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {friendsCount}
                    </p>
                    <p className="text-sm sm:text-base font-medium opacity-90 mt-1">
                      Friends
                    </p>
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    Saving together!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PHASE 3: RECENT ACTIVITY FEED */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 px-1">
              Recent Activity
            </h2>
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {mockProfileActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={cn(
                        "flex items-start gap-3 sm:gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer",
                        index !== mockProfileActivity.length - 1 && "border-b border-neutral-100"
                      )}
                      onClick={() => console.log("Activity clicked:", activity.id)}
                    >
                      {/* Activity Icon */}
                      <div className="flex-shrink-0">
                        {activity.type === "contribution" ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center text-white shadow-md">
                            <DollarSign className="size-5 sm:size-6" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-md">
                            <TrendingUp className="size-5 sm:size-6" />
                          </div>
                        )}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            {activity.type === "contribution" ? (
                              <p className="text-sm sm:text-base font-semibold text-neutral-900">
                                Contributed {formatCurrency(activity.amount)}
                              </p>
                            ) : (
                              <p className="text-sm sm:text-base font-semibold text-neutral-900">
                                Reached {activity.milestone} milestone!
                              </p>
                            )}
                            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                              {activity.circle.emoji} {activity.circle.name}
                            </p>
                          </div>
                          <span className="text-xs text-neutral-500 flex-shrink-0">
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                        </div>

                        {/* Reactions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex -space-x-2">
                            {activity.reactions.slice(0, 5).map((reaction, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full bg-white ring-2 ring-white flex items-center justify-center text-xs"
                                title={`${reaction.user.name} reacted with ${reaction.emoji}`}
                              >
                                {reaction.emoji}
                              </div>
                            ))}
                          </div>
                          {activity.reactions.length > 0 && (
                            <span className="text-xs text-neutral-500">
                              {activity.reactions.length} {activity.reactions.length === 1 ? "reaction" : "reactions"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log("View all activity")}
                    className="w-full text-primary-600 hover:text-primary-700"
                  >
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PHASE 4: ENHANCED CIRCLE CARDS */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Your Circles
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/create-circle")}
                className="gap-2 text-primary-600 hover:text-primary-700"
              >
                <PlusCircle className="size-4" />
                Create New
              </Button>
            </div>

            {/* Loading State */}
            {isLoadingCircles && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="size-8 text-primary-600 animate-spin" />
                    <p className="text-sm text-neutral-600">Loading your circles...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {!isLoadingCircles && circlesError && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="p-4 bg-error-100 rounded-full">
                      <AlertCircle className="size-8 text-error-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        Failed to load circles
                      </h3>
                      <p className="text-sm text-neutral-600 max-w-md mx-auto">
                        {circlesError instanceof Error
                          ? circlesError.message
                          : "Unable to load your circles. Please try again."}
                      </p>
                    </div>
                    <Button onClick={() => refetchCircles()} variant="outline">
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoadingCircles && !circlesError && userCircles.length === 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-neutral-100 rounded-full">
                        <Users className="size-8 text-neutral-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        No circles yet
                      </h3>
                      <p className="text-sm text-neutral-600 max-w-md mx-auto">
                        Create your first savings circle or join an existing one to get started
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button onClick={() => navigate("/create-circle")}>
                        Create Your First Circle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Circles Grid */}
            {!isLoadingCircles && !circlesError && userCircles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userCircles.map((circle) => (
                  <CircleCard
                    key={circle.id}
                    circle={circle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
