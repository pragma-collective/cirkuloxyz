import { useState, useEffect } from "react";
import { postId, PostReferenceType } from "@lens-protocol/client";
import { fetchPostReferences, fetchPost } from "@lens-protocol/client/actions";
import { lensClient } from "../lib/lens";
import type { User } from "../context/auth-context";

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
}

export interface UsePostCommentsOptions {
  postIdValue: string | null; // The post ID to fetch comments for
}

export interface UsePostCommentsResult {
  comments: Comment[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch comments for a Lens Protocol post
 * @param options - Hook options with post ID
 * @returns Comments data, loading state, error, and refetch function
 */
export function usePostComments({
  postIdValue,
}: UsePostCommentsOptions): UsePostCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = () => setRefetchKey((prev) => prev + 1);

  useEffect(() => {
    if (!postIdValue) {
      setComments([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchComments() {
      try {
        setLoading(true);
        setError(null);

        // Fetch comments using fetchPostReferences
        const result = await fetchPostReferences(lensClient, {
          referenceTypes: [PostReferenceType.CommentOn],
          referencedPost: postId(postIdValue),
        });

        if (!isMounted) return;

        if (result.isErr()) {
          console.error("[usePostComments] Error fetching comments:", result.error);
          setError(new Error(result.error.message || "Failed to fetch comments"));
          setComments([]);
          setLoading(false);
          return;
        }

        if (!result.value) {
          setComments([]);
          setLoading(false);
          return;
        }

        const commentsData = result.value.items || [];

        // Transform Lens comments to our Comment type
        const transformedComments: Comment[] = commentsData
          .filter((comment: any) => comment.__typename === "Post") // Only process Post type comments
          .map((comment: any) => {
            const metadata = comment.metadata;
            const content =
              metadata?.__typename === "TextOnlyMetadata"
                ? metadata.content
                : metadata?.__typename === "ImageMetadata"
                ? metadata.content || ""
                : "";

            return {
              id: comment.id,
              author: {
                id: comment.author.address,
                name:
                  comment.author.metadata?.name ||
                  comment.author.username?.localName ||
                  "Anonymous",
                lensUsername: comment.author.username?.localName,
                walletAddress: comment.author.address,
                lensAccounts: [],
                hasLensAccount: true,
              },
              content,
              timestamp: comment.timestamp,
            };
          });

        setComments(transformedComments);
        setLoading(false);
      } catch (err) {
        console.error("[usePostComments] Exception while fetching comments:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setComments([]);
          setLoading(false);
        }
      }
    }

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [postIdValue, refetchKey]);

  return { comments, loading, error, refetch };
}
