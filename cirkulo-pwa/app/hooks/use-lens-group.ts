import { useState, useEffect } from "react";
import { fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import type { Group } from "@lens-protocol/client";
import { lensClient } from "../lib/lens";

export interface UseLensGroupOptions {
  groupAddress: string | undefined;
}

export interface UseLensGroupResult {
  group: Group | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch Lens Protocol group details by group address
 * @param options - Hook options with group address
 * @returns Group data, loading state, and error
 */
export function useLensGroup({ groupAddress }: UseLensGroupOptions): UseLensGroupResult {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  console.log('group address: ', groupAddress);

  useEffect(() => {
    // Reset state when groupAddress changes
    setGroup(null);
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

    async function fetchGroupData() {
      try {
        console.log("[useLensGroup] Fetching group:", groupAddress);
        
        const result = await fetchGroup(lensClient, {
          group: evmAddress(groupAddress!),
        });

        if (isMounted) {
          if (result.isErr()) {
            console.error("[useLensGroup] Error fetching group:", result.error);
            setError(new Error(result.error.message || "Failed to fetch group"));
            setGroup(null);
          } else {
            console.log("[useLensGroup] Group fetched successfully:", result.value);
            setGroup(result.value);
            setError(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("[useLensGroup] Exception while fetching group:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error occurred"));
          setGroup(null);
          setLoading(false);
        }
      }
    }

    fetchGroupData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [groupAddress]);

  return { group, loading, error };
}
