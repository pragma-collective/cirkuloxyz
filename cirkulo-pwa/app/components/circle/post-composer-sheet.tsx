import { useEffect, useState, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PostComposerForm } from "./post-composer-form";
import type { PostFormData } from "~/schemas/post-schema";
import { cn } from "~/lib/utils";

export interface PostComposerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting: boolean;
  circleName: string;
}

export function PostComposerSheet({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  circleName,
}: PostComposerSheetProps) {
  // Track form data and validity
  const [formData, setFormData] = useState<PostFormData>({ content: "", image: null });
  const [isFormValid, setIsFormValid] = useState(false);

  // Handle form data changes from PostComposerForm
  const handleFormDataChange = useCallback((data: { isValid: boolean; data: PostFormData }) => {
    setFormData(data.data);
    setIsFormValid(data.isValid);
  }, []);

  // Handle submit
  const handleSubmit = async () => {
    if (isFormValid && !isSubmitting) {
      await onSubmit(formData);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  // Prevent body scroll when open
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

  // Don't render if closed
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50",
          "transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet/Modal Container */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-16 z-50",
          "sm:inset-0 sm:bottom-0 sm:flex sm:items-center sm:justify-center sm:p-4",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-composer-title"
      >
        {/* Sheet Content */}
        <div
          className={cn(
            "bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl",
            "w-full max-w-2xl",
            "max-h-[calc(90vh-4rem)] sm:max-h-[85vh]",
            "flex flex-col",
            "transform transition-all duration-300",
            isOpen ? "sm:scale-100 sm:opacity-100" : "sm:scale-95 sm:opacity-0"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div className="flex-1">
              <h2
                id="post-composer-title"
                className="text-lg sm:text-xl font-bold text-neutral-900"
              >
                Create Post
              </h2>
              <p className="text-sm text-neutral-600 mt-0.5">
                Share with {circleName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={cn(
                "p-2 rounded-full hover:bg-neutral-100",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Close composer"
            >
              <X className="size-5 text-neutral-700" />
            </button>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <PostComposerForm onDataChange={handleFormDataChange} />
          </div>

          {/* Action Bar - Fixed at Bottom */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-neutral-200 bg-white rounded-b-3xl sm:rounded-b-2xl">
            <div className="flex gap-3 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial sm:min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="flex-1 sm:flex-initial sm:min-w-[120px] bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
