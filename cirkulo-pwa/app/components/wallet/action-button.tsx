import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  iconColor?: string; // Tailwind class (e.g., "text-orange-600")
  badge?: string; // Optional badge text (e.g., "New")
  className?: string;
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  iconColor = "text-stone-600",
  badge,
  className,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative h-[72px] w-full",
        "flex flex-col items-center justify-center gap-2",
        "border border-stone-300 rounded-xl",
        "bg-white hover:bg-stone-50 active:bg-stone-100",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
        disabled && "opacity-50 cursor-not-allowed hover:bg-white",
        className
      )}
      aria-label={label}
    >
      {/* Badge (if provided) */}
      {badge && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
          {badge}
        </span>
      )}

      {/* Icon */}
      <Icon className={cn("size-6", iconColor)} />

      {/* Label */}
      <span className="text-sm font-medium text-stone-900">{label}</span>
    </button>
  );
}
