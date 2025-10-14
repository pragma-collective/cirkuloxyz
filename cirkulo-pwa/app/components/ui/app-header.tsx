import { XershaLogo } from "app/components/xersha-logo";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Button } from "app/components/ui/button";
import { DesktopNav } from "app/components/ui/desktop-nav";
import { Bell, Plus } from "lucide-react";
import type { User } from "app/context/auth-context";

export interface AppHeaderProps {
  user: User;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onNewContribution?: () => void;
}

export function AppHeader({
  user,
  notificationCount = 0,
  onNotificationClick,
  onProfileClick,
  onNewContribution,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-8">
            <XershaLogo size="sm" />
            <DesktopNav />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications - Hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:inline-flex"
              onClick={onNotificationClick}
              aria-label={
                notificationCount > 0
                  ? `${notificationCount} unread notifications`
                  : "Notifications"
              }
            >
              <Bell className="size-5" />
              {notificationCount > 0 && (
                <span
                  className="absolute top-1 right-1 size-2 bg-error-500 rounded-full"
                  aria-hidden="true"
                />
              )}
            </Button>

            {/* New Contribution - Hidden on mobile */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={onNewContribution}
            >
              <Plus className="size-4" />
              New Contribution
            </Button>

            {/* Profile Avatar */}
            <UserAvatar
              user={user}
              size="sm"
              showOnlineStatus={false}
              onClick={onProfileClick}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
