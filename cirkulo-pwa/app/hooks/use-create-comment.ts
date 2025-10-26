import { useState, useCallback } from "react";
import { postId, uri } from "@lens-protocol/client";
import { post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { textOnly } from "@lens-protocol/metadata";
import type { SessionClient } from "@lens-protocol/client";
import type { WalletClient } from "viem";
import { storageClient } from "~/lib/grove-storage";

export interface CreateCommentParams {
  content: string;
  postIdValue: string; // The post to comment on
  sessionClient: SessionClient;
  walletClient: WalletClient;
}

export interface CreateCommentResult {
  success: boolean;
  error?: Error;
  commentId?: string;
}

export interface UseCreateCommentResult {
  createComment: (params: CreateCommentParams) => Promise<CreateCommentResult>;
  isCreating: boolean;
  error: Error | null;
}

/**
 * Hook to create comments on Lens Protocol posts
 * @returns Function to create a comment and loading state
 */
export function useCreateComment(): UseCreateCommentResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createComment = useCallback(
    async (params: CreateCommentParams): Promise<CreateCommentResult> => {
      const { content, postIdValue, sessionClient, walletClient } = params;

      try {
        setIsCreating(true);
        setError(null);

        // Step 1: Create text-only metadata using Lens metadata package
        const metadata = textOnly({
          content: content.trim(),
        });

        // Step 2: Upload metadata to Grove Storage
        const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);

        // Step 3: Create the comment on Lens and wait for transaction
        const result = await post(sessionClient, {
          contentUri: uri(metadataUri),
          commentOn: {
            post: postId(postIdValue),
          },
        })
          .andThen(handleOperationWith(walletClient))
          .andThen(sessionClient.waitForTransaction);

        if (result.isErr()) {
          console.error("[useCreateComment] Error creating comment:", result.error);
          const err = new Error(
            result.error.message || "Failed to create comment"
          );
          setError(err);
          setIsCreating(false);
          return { success: false, error: err };
        }

        const txHash = result.value;

        setIsCreating(false);
        return { success: true, commentId: txHash };
      } catch (err) {
        console.error("[useCreateComment] Exception while creating comment:", err);
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setIsCreating(false);
        return { success: false, error };
      }
    },
    []
  );

  return {
    createComment,
    isCreating,
    error,
  };
}
