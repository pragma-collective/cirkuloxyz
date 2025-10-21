import { group, GroupMetadataSchema } from "@lens-protocol/metadata";
import { createGroup, fetchGroup } from "@lens-protocol/client/actions";
import { uri, evmAddress, GroupRuleExecuteOn } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { storageClient } from "../lib/grove-storage";
import type { SessionClient } from "@lens-protocol/client";
import type { WalletClient } from "viem";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * Convert a user-friendly name to a Lens-compatible group name
 * Lens requires: only alphanumeric characters and hyphens, max 50 chars
 *
 * Examples:
 * - "JCO Donuts" → "jco-donuts"
 * - "Team #1 Savings!" → "team-1-savings"
 * - "Summer Vacation Fund" → "summer-vacation-fund"
 */
function slugifyGroupName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
    .replace(/-{2,}/g, '-')        // Replace multiple consecutive hyphens with single
    .slice(0, 50);                 // Ensure max 50 chars
}

export interface CreateGroupParams {
  name: string;
  description: string;
  ownerAddress: string;
  sessionClient: SessionClient;
  walletClient: WalletClient;
}

export interface CreateGroupResult {
  success: boolean;
  groupAddress?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Creates a Lens group with metadata
 * @param params - Group creation parameters
 * @returns Result with group address and transaction hash
 */
export async function createLensGroup(
  params: CreateGroupParams
): Promise<CreateGroupResult> {
  try {
    const { name, description, ownerAddress, sessionClient, walletClient } = params;

    console.log("[CreateLensGroup] Starting group creation:", { name, description, ownerAddress });

    // Validate owner address format
    if (!ownerAddress || !ownerAddress.startsWith('0x') || ownerAddress.length !== 42) {
      console.error("[CreateLensGroup] Invalid owner address format:", ownerAddress);
      return {
        success: false,
        error: "Invalid owner address format",
      };
    }

    // Convert name to Lens-compatible format (alphanumeric and hyphens only)
    const slugifiedName = slugifyGroupName(name);
    console.log("[CreateLensGroup] Slugified name:", { original: name, slugified: slugifiedName });

    // Step 1: Create group metadata
    // Note: The group() helper from @lens-protocol/metadata has intermittent bugs
    // We try it first, then fall back to manual construction if it fails
    let metadata;

    try {
      // Attempt to use the group() helper
      metadata = group({
        name: slugifiedName,
        description: String(description).trim(),
      });
      console.log("[CreateLensGroup] Metadata created with group() helper");
    } catch (groupError: any) {
      // Fallback: Manually construct metadata to bypass SDK bug
      console.warn("[CreateLensGroup] group() helper failed, using manual construction");

      const manualMetadata: any = {
        $schema: "https://json-schemas.lens.dev/group/1.0.0.json",
        lens: {
          id: uuidv4(),
          name: slugifiedName,
          description: String(description).trim(),
        }
      };

      // Validate manually constructed metadata
      const validated = GroupMetadataSchema.parse(manualMetadata);
      metadata = validated;
      console.log("[CreateLensGroup] Metadata created manually");
    }

    // Step 2: Upload metadata to Grove storage
    console.log("[CreateLensGroup] Uploading metadata to Grove storage...");
    const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);

    console.log("[CreateLensGroup] Metadata uploaded:", metadataUri);

    // Step 3: Configure custom invite rule
    const ruleContractAddress = import.meta.env.VITE_LENS_INVITE_RULE_CONTRACT_ADDRESS;
    
    if (!ruleContractAddress) {
      console.error("[CreateLensGroup] VITE_LENS_INVITE_RULE_CONTRACT_ADDRESS not configured");
      return {
        success: false,
        error: "Invite rule contract address not configured",
      };
    }

    // Validate address format
    if (!ruleContractAddress.startsWith('0x') || ruleContractAddress.length !== 42) {
      console.error("[CreateLensGroup] Invalid rule contract address format:", ruleContractAddress);
      return {
        success: false,
        error: "Invalid rule contract address format",
      };
    }

    console.log("[CreateLensGroup] Using invite rule contract:", ruleContractAddress);

    // Step 4: Deploy group contract with custom invite rule
    console.log("[CreateLensGroup] Creating group on-chain with custom rule...");
    console.log("[CreateLensGroup] Group creation params:", {
      metadataUri,
      ownerAddress,
      ruleContractAddress,
      executeOn: [GroupRuleExecuteOn.Joining],
    });

    // Try with corrected rule structure - empty params since configure() doesn't need them
    const createResult = await createGroup(sessionClient, {
      metadataUri: uri(metadataUri),
      owner: evmAddress(ownerAddress),
      rules: {
        required: [
          {
            unknownRule: {
              address: evmAddress(ruleContractAddress),
              executeOn: [GroupRuleExecuteOn.Joining],
              params: [], // Empty params - configure() doesn't need any parameters
            },
          },
        ],
        anyOf: [],
      },
    })
      .andThen(handleOperationWith(walletClient))
      .andThen(sessionClient.waitForTransaction)
      .andThen((txHash) => fetchGroup(sessionClient, { txHash }));

    if (createResult.isErr()) {
      console.error("[CreateLensGroup] Group creation failed:", createResult.error);
      return {
        success: false,
        error: createResult.error.message || "Failed to create group",
      };
    }

    const createdGroup = createResult.value;
    console.log("[CreateLensGroup] Group created successfully:", {
      address: createdGroup?.address,
      owner: createdGroup?.owner,
    });

    return {
      success: true,
      transactionHash: undefined, // txHash is consumed by fetchGroup
      groupAddress: createdGroup?.address,
    };
  } catch (error) {
    console.error("[CreateLensGroup] Error creating Lens group:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Hook for creating a Lens group with loading and error states
 */
export function useCreateLensGroup() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = async (
    params: CreateGroupParams
  ): Promise<CreateGroupResult> => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await createLensGroup(params);

      if (!result.success) {
        setError(result.error || "Failed to create group");
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
  };

  return {
    createGroup,
    isCreating,
    error,
  };
}
