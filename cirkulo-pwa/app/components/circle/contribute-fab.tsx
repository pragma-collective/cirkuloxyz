import { DollarSign, Heart, Plus } from "lucide-react";
import type { Circle } from "app/types/feed";
import { cn } from "app/lib/utils";

export interface ContributeFABProps {
  circle: Circle;
  onClick: () => void;
  className?: string;
}

export function ContributeFAB({ circle, onClick, className }: ContributeFABProps) {
  // Get appropriate icon and text based on circle type
  const getButtonConfig = () => {
    if (circle.circleType === "fundraising") {
      return {
        icon: Heart,
        label: "Donate",
        ariaLabel: "Donate to this fundraiser",
      };
    }

    return {
      icon: DollarSign,
      label: "Contribute",
      ariaLabel: "Contribute to this circle",
    };
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        // Position: Fixed bottom-right, above mobile nav
        "fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30",
        // Size and shape
        "flex items-center gap-2 px-5 py-3.5 sm:px-6 sm:py-4 rounded-full",
        // Styling
        "bg-gradient-to-r from-primary-500 to-secondary-500",
        "text-white font-bold shadow-2xl",
        // Interactions
        "hover:from-primary-600 hover:to-secondary-600",
        "hover:shadow-3xl hover:scale-105",
        "active:scale-95",
        "transition-all duration-200",
        // Animation
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        className
      )}
      aria-label={config.ariaLabel}
    >
      <Icon className="size-5 sm:size-6" strokeWidth={2.5} />
      <span className="text-sm sm:text-base">{config.label}</span>
    </button>
  );
}
