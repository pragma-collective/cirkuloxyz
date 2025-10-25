import { useState, useEffect } from "react";
import { Plus, Edit3, DollarSign } from "lucide-react";
import type { Circle } from "app/types/feed";
import { cn } from "app/lib/utils";

export interface CircleFABProps {
  circle: Circle;
  onContribute: () => void;
  onCreatePost: () => void;
  className?: string;
}

export function CircleFAB({
  circle,
  onContribute,
  onCreatePost,
  className,
}: CircleFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  const handleOptionClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-200 z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* FAB Container */}
      <div
        className={cn(
          "fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3",
          className
        )}
      >
        {/* Speed Dial Options */}
        <div
          className={cn(
            "flex flex-col items-end gap-3 transition-all duration-200",
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          {/* Create Post Option */}
          <button
            onClick={() => handleOptionClick(onCreatePost)}
            className={cn(
              "flex items-center gap-3 pl-4 pr-5 py-3 rounded-full shadow-lg",
              "bg-gradient-to-r from-secondary-500 to-secondary-600",
              "text-white font-medium text-sm",
              "hover:from-secondary-600 hover:to-secondary-700",
              "active:scale-95 transition-all duration-200",
              "animate-in slide-in-from-bottom-2 fade-in",
              "min-w-[140px] justify-start"
            )}
            style={{ animationDelay: "50ms" }}
            aria-label="Create post in circle"
          >
            <Edit3 className="size-5" strokeWidth={2} />
            <span>Create Post</span>
          </button>

          {/* Contribute Option */}
          <button
            onClick={() => handleOptionClick(onContribute)}
            className={cn(
              "flex items-center gap-3 pl-4 pr-5 py-3 rounded-full shadow-lg",
              "bg-gradient-to-r from-success-500 to-success-600",
              "text-white font-medium text-sm",
              "hover:from-success-600 hover:to-success-700",
              "active:scale-95 transition-all duration-200",
              "animate-in slide-in-from-bottom-2 fade-in",
              "min-w-[140px] justify-start"
            )}
            style={{ animationDelay: "100ms" }}
            aria-label="Contribute to circle"
          >
            <DollarSign className="size-5" strokeWidth={2} />
            <span>Contribute</span>
          </button>
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "size-14 rounded-full shadow-2xl",
            "bg-gradient-to-r from-primary-500 to-secondary-500",
            "hover:from-primary-600 hover:to-secondary-600",
            "active:scale-95",
            "flex items-center justify-center",
            "transition-all duration-200",
            "focus:outline-none focus:ring-4 focus:ring-primary-500/30"
          )}
          aria-label={isOpen ? "Close quick actions menu" : "Open quick actions menu"}
          aria-expanded={isOpen}
        >
          <Plus
            className={cn(
              "size-6 text-white transition-transform duration-200",
              isOpen && "rotate-45"
            )}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </>
  );
}
