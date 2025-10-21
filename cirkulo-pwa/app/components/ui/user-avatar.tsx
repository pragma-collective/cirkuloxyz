import type { User } from "app/context/auth-context";
import { cn } from "app/lib/utils";

export interface UserAvatarProps {
  user: User;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showOnlineStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: "size-8",
  sm: "size-10",
  md: "size-12",
  lg: "size-16",
  xl: "size-24",
};

const textSizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl",
};

const statusSizeClasses = {
  xs: "size-2",
  sm: "size-2.5",
  md: "size-3",
  lg: "size-4",
  xl: "size-5",
};

export function UserAvatar({
  user,
  size = "sm",
  showOnlineStatus = false,
  className,
  onClick,
}: UserAvatarProps) {
  // Handle null/undefined user
  if (!user) {
    return null;
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    : "?";

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={cn(
        "relative flex-shrink-0 rounded-full",
        sizeClasses[size],
        onClick &&
          "hover:scale-105 hover:shadow-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:outline-none",
        className
      )}
      onClick={onClick}
      {...(onClick && {
        type: "button",
        "aria-label": `View ${user.name || "user"}'s profile`,
      })}
    >
      <div
        className={cn(
          "size-full rounded-full bg-gradient-to-br from-primary-400 to-secondary-400",
          "flex items-center justify-center text-white font-semibold border-2 border-primary-500",
          textSizeClasses[size]
        )}
      >
        {initials}
      </div>

      {showOnlineStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 bg-success-500 rounded-full ring-2 ring-white",
            statusSizeClasses[size]
          )}
          aria-hidden="true"
        />
      )}
    </Component>
  );
}
