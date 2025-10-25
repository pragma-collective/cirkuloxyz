import { useState, useEffect, useCallback } from "react";
import { fetchGroup, fetchPosts } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import type { AnyPost } from "@lens-protocol/client";
import { lensClient } from "../lib/lens";
import type { PostFeedItem, FeedItem } from "../types/feed";
import type { User } from "../context/auth-context";

export interface UseFetchGroupPostsOptions {
  groupAddress: string | undefined;
}

export interface UseFetchGroupPostsResult {
  posts: PostFeedItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Transform a Lens Protocol Post to a PostFeedItem
 */
function transformLensPostToFeedItem(anyPost: AnyPost, groupInfo: { id: string; name: string }): PostFeedItem {
  // AnyPost can be Post or Repost - we only handle Post for now
  if (anyPost.__typename !== "Post") {
    throw new Error("Reposts are not yet supported in feed transformation");
  }

  const post = anyPost;

  // Parse metadata to get content and image
  const metadata = post.metadata;
  const content = metadata?.__typename === "TextOnlyMetadata"
    ? metadata.content
    : metadata?.__typename === "ImageMetadata"
    ? metadata.content || ""
    : "";

  const imageUrl = metadata?.__typename === "ImageMetadata" && metadata.image
    ? metadata.image.item
    : undefined;

  // Transform author to User type
  const author: User = {
    id: post.author.address,
    name: post.author.metadata?.name || post.author.username?.localName || "Anonymous",
    lensUsername: post.author.username?.localName,
    walletAddress: post.author.address,
    lensAccounts: [],
    hasLensAccount: true,
  };

  return {
    id: post.id,
    type: "post",
    timestamp: post.timestamp,
    actor: author,
    circle: {
      id: groupInfo.id,
      name: groupInfo.name,
      circleType: "contribution",
      contributionSchedule: "monthly",
      goalName: "Group Goal",
      goalAmount: 0,
      currentAmount: 0,
      memberCount: 0,
      progress: 0,
      members: [],
    },
    content: content || "",
    imageUrl,
    imageAlt: imageUrl ? "Post image" : undefined,
    likeCount: post.stats?.upvotes || 0,
    commentCount: post.stats?.comments || 0,
    isLiked: false, // TODO: Check if current user has liked
  };
}

/**
 * Hook to fetch posts from a Lens Protocol group feed
 * @param options - Hook options with group address
 * @returns Posts data, loading state, and error
 */
export function useFetchGroupPosts({
  groupAddress
}: UseFetchGroupPostsOptions): UseFetchGroupPostsResult {
  const [posts, setPosts] = useState<PostFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  // Refetch function to manually trigger a new fetch
  const refetch = useCallback(() => {
    setRefetchKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Reset state when groupAddress changes
    setPosts([]);
    setError(null);
    setLoading(true);

    // Skip if no address provided
    if (!groupAddress) {
      setLoading(false);
      return;
    }

    // Validate address format
    if (!groupAddress.startsWith("0x") || groupAddress.length !== 42) {
      setError(new Error("Invalid Ethereum address format"));
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchGroupPosts() {
      try {
        console.log("[useFetchGroupPosts] Fetching group:", groupAddress);

        // Step 1: Fetch the group to get feed information
        const groupResult = await fetchGroup(lensClient, {
          group: evmAddress(groupAddress!),
        });

        if (!isMounted) return;

        if (groupResult.isErr()) {
          console.error("[useFetchGroupPosts] Error fetching group:", groupResult.error);
          setError(new Error(groupResult.error.message || "Failed to fetch group"));
          setPosts([]);
          setLoading(false);
          return;
        }

        const group = groupResult.value;

        if (!group) {
          setError(new Error("Group not found"));
          setLoading(false);
          return;
        }

        console.log("[useFetchGroupPosts] Group fetched successfully:", group);

        // Check if group has a feed
        if (!group.feed) {
          console.log("[useFetchGroupPosts] Group has no feed");
          setPosts([]);
          setLoading(false);
          return;
        }

        // Step 2: Fetch posts from the group's feed
        let allPosts: AnyPost[] = [];
        let cursor: string | undefined = undefined;

        console.log("[useFetchGroupPosts] Fetching posts from feed:", group.feed.address);

        const postsResult = await fetchPosts(lensClient, {
          filter: {
            feeds: [{ feed: evmAddress(group.feed.address) }],
          },
        });

        if (!isMounted) return;

        if (postsResult.isErr()) {
          console.error("[useFetchGroupPosts] Error fetching posts:", postsResult.error);
          setError(new Error(postsResult.error.message || "Failed to fetch posts"));
          setPosts([]);
          setLoading(false);
          return;
        }

        // Handle null result (no posts)
        if (!postsResult.value) {
          console.log("[useFetchGroupPosts] No posts found for group");
          setPosts([]);
          setLoading(false);
          return;
        }

        allPosts = [...postsResult.value.items];
        cursor = postsResult.value.pageInfo.next ?? undefined;

        // Handle pagination - fetch more posts if available
        while (cursor && isMounted) {
          const nextResult = await fetchPosts(lensClient, {
            filter: {
              feeds: [{ feed: evmAddress(group.feed.address) }],
            },
            cursor,
          });

          if (nextResult.isErr() || !nextResult.value) {
            break;
          }

          allPosts = [...allPosts, ...nextResult.value.items];
          cursor = nextResult.value.pageInfo.next ?? undefined;
        }

        if (!isMounted) return;

        // Step 3: Transform posts to FeedItem format (filter out Reposts for now)
        const transformedPosts = allPosts
          .filter((p) => p.__typename === "Post")
          .map((lensPost) =>
            transformLensPostToFeedItem(lensPost, {
              id: group?.address || groupAddress,
              name: group?.metadata?.name || "Group",
            })
          );

        console.log("[useFetchGroupPosts] Transformed posts:", transformedPosts);
        setPosts(transformedPosts);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("[useFetchGroupPosts] Exception while fetching posts:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error occurred"));
          setPosts([]);
          setLoading(false);
        }
      }
    }

    fetchGroupPosts();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [groupAddress, refetchKey]);

  return { posts, loading, error, refetch };
}
