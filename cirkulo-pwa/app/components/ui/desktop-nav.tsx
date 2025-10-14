import { Link, useLocation } from "react-router";
import { Home, Compass } from "lucide-react";
import { cn } from "app/lib/utils";

export interface DesktopNavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
}

export interface DesktopNavProps {
  items?: DesktopNavItem[];
  className?: string;
}

const defaultItems: DesktopNavItem[] = [
  { icon: <Home className="size-4" />, label: "Home", to: "/dashboard" },
  { icon: <Compass className="size-4" />, label: "Explore", to: "/explore" },
];

export function DesktopNav({ items = defaultItems, className }: DesktopNavProps) {
  const location = useLocation();

  return (
    <nav className={cn("hidden md:flex items-center gap-1", className)} aria-label="Primary navigation">
      {items.map((item) => {
        const isActive = location.pathname === item.to;

        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-medium transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2",
              "hover:bg-neutral-50/80",
              isActive
                ? "text-primary-600 font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={cn("transition-colors duration-200", isActive ? "text-primary-600" : "text-neutral-500")} aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-500 rounded-full" aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
