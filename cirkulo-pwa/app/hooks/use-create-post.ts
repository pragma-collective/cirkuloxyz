import { useState, useCallback } from "react";
import { textOnly, image as imagePost, MediaImageMimeType } from "@lens-protocol/metadata";
import { post, fetchGroup } from "@lens-protocol/client/actions";
import { uri, evmAddress } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { storageClient } from "~/lib/grove-storage";
import { lensClient } from "~/lib/lens";
import type { SessionClient } from "@lens-protocol/client";
import type { WalletClient } from "viem";
import { v4 as uuidv4 } from "uuid";

export interface CreatePostParams {
  content?: string;
  image?: File;
  groupAddress: string;
  sessionClient: SessionClient;
  walletClient: WalletClient;
}

export interface CreatePostResult {
  success: boolean;
  postId?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Upload an image to Grove storage
 * @param file - Image file to upload
 * @returns Promise resolving to the image URI
 */
export async function uploadImageToGrove(file: File): Promise<string> {
  console.log("[CreatePost] Uploading image to Grove storage...");

  try {
    const { uri: imageUri } = await storageClient.uploadFile(file);
    console.log("[CreatePost] Image uploaded:", imageUri);
    return imageUri;
  } catch (error) {
    console.error("[CreatePost] Error uploading image:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to upload image: ${error.message}`
        : "Failed to upload image"
    );
  }
}

/**
 * Create a post in a Lens group with optional image attachment
 * @param params - Post creation parameters
 * @returns Result with post ID and transaction hash
 */
export async function createLensPost(
  params: CreatePostParams
): Promise<CreatePostResult> {
  try {
    const { content, image, groupAddress, sessionClient, walletClient } = params;

    console.log("[CreatePost] Starting post creation:", {
      hasContent: !!content,
      hasImage: !!image,
      groupAddress,
    });

    // Validate: must have either content or image
    if (!content?.trim() && !image) {
      return {
        success: false,
        error: "Post must contain text or an image",
      };
    }

    // Step 1: Upload image if present
    let imageUri: string | undefined;
    if (image) {
      imageUri = await uploadImageToGrove(image);
    }

    // Step 2: Create post metadata
    console.log("[CreatePost] Creating post metadata...");

    const metadata = imageUri
      ? imagePost({
          image: {
            item: imageUri,
            type: MediaImageMimeType.PNG, // Simplified - could detect from file.type
          },
          content: content?.trim() || "",
        })
      : textOnly({
          content: content?.trim() || "",
        });

    console.log("[CreatePost] Post metadata created");

    // Step 3: Upload metadata to Grove storage
    console.log("[CreatePost] Uploading metadata to Grove storage...");
    const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);
    console.log("[CreatePost] Metadata uploaded:", metadataUri);

    // Step 3.5: Fetch group to get feed address
    console.log("[CreatePost] Fetching group to get feed address...");
    const groupResult = await fetchGroup(lensClient, {
      group: evmAddress(groupAddress),
    });

    if (groupResult.isErr()) {
      console.error("[CreatePost] Failed to fetch group:", groupResult.error);
      return {
        success: false,
        error: groupResult.error.message || "Failed to fetch group",
      };
    }

    if (!groupResult.value) {
      console.error("[CreatePost] Group not found");
      return {
        success: false,
        error: "Group not found",
      };
    }

    if (!groupResult.value.feed) {
      console.error("[CreatePost] Group does not have a feed");
      return {
        success: false,
        error: "Group does not have a feed",
      };
    }

    const feedAddress = groupResult.value.feed.address;
    console.log("[CreatePost] Group feed address:", feedAddress);

    // Step 4: Create post transaction on group feed
    console.log("[CreatePost] Creating post transaction on group feed...");

    const postResult = await post(sessionClient, {
      contentUri: uri(metadataUri),
      feed: evmAddress(feedAddress),
    })
      .andThen(handleOperationWith(walletClient))
      .andThen(sessionClient.waitForTransaction);

    if (postResult.isErr()) {
      console.error("[CreatePost] Post creation failed:", postResult.error);
      return {
        success: false,
        error: postResult.error.message || "Failed to create post",
      };
    }

    const txHash = postResult.value;
    console.log("[CreatePost] Post created successfully:", {
      transactionHash: txHash,
    });

    return {
      success: true,
      postId: uuidv4(), // Temporary ID until we can fetch the actual post ID
      transactionHash: txHash,
    };
  } catch (error) {
    console.error("[CreatePost] Error creating post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Hook for creating a post with loading and error states
 */
export function useCreatePost() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const createPost = useCallback(
    async (params: CreatePostParams): Promise<CreatePostResult> => {
      setIsCreating(true);
      setError(null);
      setProgress(0);

      try {
        // Simulate progress for image upload
        if (params.image) {
          setProgress(25);
        }

        const result = await createLensPost(params);

        if (!result.success) {
          setError(result.error || "Failed to create post");
        } else {
          setProgress(100);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    createPost,
    isCreating,
    error,
    progress,
  };
}
