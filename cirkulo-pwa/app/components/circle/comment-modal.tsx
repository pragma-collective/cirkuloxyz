import { useState, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { UserAvatar } from "../ui/user-avatar";
import { Button } from "../ui/button";
import { usePostComments, type Comment } from "~/hooks/use-post-comments";
import { useCreateComment } from "~/hooks/use-create-comment";
import { useLensSession } from "~/context/lens-context";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { cn } from "~/lib/utils";

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
  postAuthor: {
    name: string;
    avatar?: string;
  };
  initialCommentCount?: number;
}

export function CommentModal({
  isOpen,
  onClose,
  postId,
  postContent,
  postAuthor,
  initialCommentCount = 0,
}: CommentModalProps) {
  const [commentText, setCommentText] = useState("");
  const { sessionClient, selectedAccount } = useLensSession();
  const { primaryWallet } = useDynamicContext();

  // Fetch comments for this post
  const { comments, loading: loadingComments, refetch: refetchComments } = usePostComments({
    postIdValue: isOpen ? postId : null, // Only fetch when modal is open
  });

  // Create comment hook
  const { createComment, isCreating } = useCreateComment();

  // Reset comment text when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCommentText("");
    }
  }, [isOpen]);

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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isCreating) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isCreating, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !sessionClient || !primaryWallet) {
      return;
    }

    try {
      // @ts-expect-error - getWalletClient exists at runtime
      const walletClient = await primaryWallet.getWalletClient();

      const result = await createComment({
        content: commentText.trim(),
        postIdValue: postId,
        sessionClient,
        walletClient,
      });

      if (result.success) {
        setCommentText("");
        // Refetch comments after a delay to allow Lens indexing
        setTimeout(() => {
          refetchComments();
        }, 3000);
      } else {
        console.error("[CommentModal] Failed to create comment:", result.error);
        // TODO: Show error toast
      }
    } catch (error) {
      console.error("[CommentModal] Error creating comment:", error);
      // TODO: Show error toast
    }
  };

  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isCreating) {
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
        aria-labelledby="comments-title"
      >
        {/* Sheet Content */}
        <div
          className={cn(
            "bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl",
            "w-full max-w-2xl",
            "h-[85vh] sm:max-h-[90vh]",
            "flex flex-col",
            "transform transition-all duration-300",
            isOpen ? "sm:scale-100 sm:opacity-100" : "sm:scale-95 sm:opacity-0"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 flex-shrink-0">
            <div className="flex-1">
              <h2 id="comments-title" className="text-lg sm:text-xl font-bold text-stone-900">
                Comments
              </h2>
              <p className="text-sm text-stone-600 mt-0.5">
                {comments.length} {comments.length === 1 ? "comment" : "comments"}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isCreating}
              className={cn(
                "p-2 rounded-full hover:bg-stone-100",
                "transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Close"
            >
              <X className="size-5 text-stone-600" />
            </button>
          </div>

          {/* Original Post */}
          <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex-shrink-0">
            <div className="flex items-start gap-3">
              <UserAvatar
                user={{ name: postAuthor.name, id: "author" }}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900">
                  {postAuthor.name}
                </p>
                <p className="text-sm text-stone-700 mt-1 line-clamp-3">
                  {postContent}
                </p>
              </div>
            </div>
          </div>

          {/* Comments List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loadingComments ? (
              // Loading skeleton
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-stone-200 rounded w-1/4" />
                      <div className="h-3 bg-stone-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  No comments yet
                </h3>
                <p className="text-sm text-stone-600 max-w-sm">
                  Be the first to share your thoughts on this post!
                </p>
              </div>
            ) : (
              // Comments list
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <UserAvatar user={comment.author} size="sm" className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="bg-stone-100 rounded-2xl px-4 py-3">
                        <p className="text-sm font-semibold text-stone-900">
                          {comment.author.name}
                        </p>
                        <p className="text-sm text-stone-700 mt-1 whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 ml-4">
                        {formatRelativeTime(comment.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment Input - Fixed at bottom */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-4 border-t border-stone-200 bg-white flex-shrink-0"
          >
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border border-stone-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500",
                    "resize-none min-h-[48px] max-h-[120px]",
                    "placeholder:text-stone-400",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  rows={1}
                  disabled={isCreating}
                />
              </div>
              <Button
                type="submit"
                disabled={!commentText.trim() || isCreating}
                className={cn(
                  "px-4 py-3 rounded-full flex-shrink-0",
                  "bg-gradient-to-r from-primary-500 to-secondary-500",
                  "text-white font-medium",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hover:shadow-lg transition-all"
                )}
              >
                {isCreating ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Send className="size-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
