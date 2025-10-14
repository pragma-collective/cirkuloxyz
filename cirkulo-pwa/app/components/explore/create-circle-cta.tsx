import { Button } from "app/components/ui/button";
import { PlusCircle } from "lucide-react";

export interface CreateCircleCTAProps {
  onClick?: () => void;
}

export function CreateCircleCTA({ onClick }: CreateCircleCTAProps) {
  return (
    <>
      {/* Mobile: Floating Action Button */}
      <button
        onClick={onClick}
        className="fixed bottom-20 right-4 size-14 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600
                   text-white shadow-2xl hover:shadow-primary-500/50 active:scale-95
                   transition-all duration-200 z-40 flex items-center justify-center
                   focus-visible:ring-4 focus-visible:ring-primary-500/30 md:hidden"
        aria-label="Create new circle"
      >
        <PlusCircle className="size-6" />
      </button>

      {/* Desktop: Inline Banner */}
      <div className="hidden md:block bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 my-8 border-2 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              Don't see what you're looking for?
            </h3>
            <p className="text-neutral-600">
              Create your own circle and invite friends to save together for any goal.
            </p>
          </div>
          <Button size="lg" onClick={onClick}>
            <PlusCircle className="size-5" />
            Create Circle
          </Button>
        </div>
      </div>
    </>
  );
}
