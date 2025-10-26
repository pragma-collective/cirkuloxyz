import { useState, useCallback } from "react";
import { PostReactionType, postId } from "@lens-protocol/client";
import { addReaction, undoReaction } from "@lens-protocol/client/actions";
import type { SessionClient } from "@lens-protocol/client";

export interface UsePostReactionsOptions {
  sessionClient: SessionClient | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UsePostReactionsResult {
  addLike: (postIdValue: string) => Promise<boolean>;
  removeLike: (postIdValue: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to handle like/unlike operations on Lens Protocol posts
 * @param options - Configuration options
 * @returns Functions to add/remove likes and loading state
 */
export function usePostReactions({
  sessionClient,
  onSuccess,
  onError,
}: UsePostReactionsOptions): UsePostReactionsResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Add a like (upvote) to a post
   * @param postIdValue - The Lens post ID
   * @returns Success boolean
   */
  const addLike = useCallback(
    async (postIdValue: string): Promise<boolean> => {
      if (!sessionClient) {
        const err = new Error("Session client not available");
        setError(err);
        onError?.(err);
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("[usePostReactions] Adding like to post:", postIdValue);

        const result = await addReaction(sessionClient, {
          post: postId(postIdValue),
          reaction: PostReactionType.Upvote,
        });

        if (result.isErr()) {
          console.error("[usePostReactions] Error adding like:", result.error);
          const err = new Error(result.error.message || "Failed to add like");
          setError(err);
          onError?.(err);
          return false;
        }

        const success = result.value;
        console.log("[usePostReactions] Like added successfully:", success);

        if (success) {
          onSuccess?.();
        }

        return success;
      } catch (err) {
        console.error("[usePostReactions] Exception while adding like:", err);
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionClient, onSuccess, onError]
  );

  /**
   * Remove a like (undo upvote) from a post
   * @param postIdValue - The Lens post ID
   * @returns Success boolean
   */
  const removeLike = useCallback(
    async (postIdValue: string): Promise<boolean> => {
      if (!sessionClient) {
        const err = new Error("Session client not available");
        setError(err);
        onError?.(err);
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("[usePostReactions] Removing like from post:", postIdValue);

        const result = await undoReaction(sessionClient, {
          post: postId(postIdValue),
          reaction: PostReactionType.Upvote,
        });

        if (result.isErr()) {
          console.error("[usePostReactions] Error removing like:", result.error);
          const err = new Error(result.error.message || "Failed to remove like");
          setError(err);
          onError?.(err);
          return false;
        }

        const success = result.value;
        console.log("[usePostReactions] Like removed successfully:", success);

        if (success) {
          onSuccess?.();
        }

        return success;
      } catch (err) {
        console.error("[usePostReactions] Exception while removing like:", err);
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionClient, onSuccess, onError]
  );

  return {
    addLike,
    removeLike,
    isLoading,
    error,
  };
}
