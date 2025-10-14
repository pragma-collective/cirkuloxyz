import { Link } from "react-router";
import { Home, Compass, PlusCircle, Bell, User } from "lucide-react";
import { cn } from "app/lib/utils";

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  to?: string; // React Router path
  onClick?: () => void;
}

export interface MobileBottomNavProps {
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  { icon: <Home className="size-6" />, label: "Home", active: true, to: "/dashboard" },
  { icon: <Compass className="size-6" />, label: "Explore", to: "/explore" },
  { icon: <PlusCircle className="size-6" />, label: "Add" },
  { icon: <Bell className="size-6" />, label: "Alerts", badge: 0 },
  { icon: <User className="size-6" />, label: "Profile" },
];

export function MobileBottomNav({ items = defaultItems }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl z-50 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item, index) => {
          const className = cn(
            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg",
            "transition-colors duration-200 min-w-[60px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
            item.active
              ? "text-primary-600"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
          );

          const content = (
            <>
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 size-4 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    aria-label={`${item.badge} ${item.label.toLowerCase()}`}
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </>
          );

          // Use Link if 'to' prop is provided, otherwise use button
          if (item.to) {
            return (
              <Link
                key={index}
                to={item.to}
                className={className}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={item.onClick}
              className={className}
              aria-label={item.label}
              aria-current={item.active ? "page" : undefined}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
