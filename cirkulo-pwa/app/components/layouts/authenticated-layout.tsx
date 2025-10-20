import { type ReactNode } from "react";
import { AppHeader } from "app/components/ui/app-header";
import { MobileBottomNav, type NavItem } from "app/components/dashboard/mobile-bottom-nav";
import { useAuth } from "app/context/auth-context";

export interface AuthenticatedLayoutProps {
  children: ReactNode;
  navItems?: NavItem[];
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onNewContribution?: () => void;
  notificationCount?: number;
}

export function AuthenticatedLayout({
  children,
  navItems,
  onNotificationClick,
  onProfileClick,
  onNewContribution,
  notificationCount = 0,
}: AuthenticatedLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden pb-20 md:pb-0">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <AppHeader
          user={user!}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
          onNewContribution={onNewContribution}
        />

        {/* Page Content */}
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav items={navItems} />
    </div>
  );
}
