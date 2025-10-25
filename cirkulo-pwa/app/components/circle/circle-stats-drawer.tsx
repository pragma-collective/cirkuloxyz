import { useEffect } from "react";
import { X } from "lucide-react";
import type { Circle } from "app/types/feed";
import { CircleProgress } from "./circle-progress";
import { cn } from "app/lib/utils";

export interface CircleStatsDrawerProps {
  circle: Circle;
  isOpen: boolean;
  onClose: () => void;
}

export function CircleStatsDrawer({
  circle,
  isOpen,
  onClose,
}: CircleStatsDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white rounded-b-3xl shadow-2xl",
          "transition-transform duration-300 ease-out",
          "max-h-[85vh] overflow-y-auto",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-drawer-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-200 z-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <h2
                id="stats-drawer-title"
                className="text-lg sm:text-xl font-bold text-neutral-900"
              >
                Circle Stats
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-neutral-100 transition-colors"
                aria-label="Close stats"
              >
                <X className="size-5 sm:size-6 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <CircleProgress circle={circle} />
          </div>
        </div>

        {/* Drag Handle Indicator (visual cue) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div className="w-12 h-1 bg-neutral-300 rounded-full" />
        </div>
      </div>
    </>
  );
}
