import { useState, useEffect } from "react";
import { fetchGroupMembers } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import type { GroupMember } from "@lens-protocol/client";
import { lensClient } from "../lib/lens";

export interface UseFetchGroupMembersOptions {
  groupAddress: string | undefined;
}

export interface UseFetchGroupMembersResult {
  members: GroupMember[];
  memberCount: number;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch Lens Protocol group members by group address
 * @param options - Hook options with group address
 * @returns Members array, member count, loading state, and error
 */
export function useFetchGroupMembers({ groupAddress }: UseFetchGroupMembersOptions): UseFetchGroupMembersResult {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when groupAddress changes
    setMembers([]);
    setMemberCount(0);
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

    async function fetchMembers() {
      try {
        console.log("[useFetchGroupMembers] Fetching members for group:", groupAddress);

        // Fetch all members (handle pagination if needed)
        let allMembers: GroupMember[] = [];
        let cursor: string | undefined = undefined;

        // Fetch first page
        const result = await fetchGroupMembers(lensClient, {
          group: evmAddress(groupAddress!),
        });

        if (result.isErr()) {
          console.error("[useFetchGroupMembers] Error fetching members:", result.error);
          if (isMounted) {
            setError(new Error(result.error.message || "Failed to fetch group members"));
            setMembers([]);
            setMemberCount(0);
            setLoading(false);
          }
          return;
        }

        allMembers = result.value.items;
        cursor = result.value.pageInfo.next;

        // Fetch remaining pages if there are more
        while (cursor && isMounted) {
          const nextResult = await fetchGroupMembers(lensClient, {
            group: evmAddress(groupAddress!),
            cursor,
          });

          if (nextResult.isErr()) {
            console.warn("[useFetchGroupMembers] Error fetching next page:", nextResult.error);
            break; // Stop pagination on error, but keep what we have
          }

          allMembers = [...allMembers, ...nextResult.value.items];
          cursor = nextResult.value.pageInfo.next;
        }

        if (isMounted) {
          console.log(`[useFetchGroupMembers] Fetched ${allMembers.length} members`);
          setMembers(allMembers);
          setMemberCount(allMembers.length);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("[useFetchGroupMembers] Exception while fetching members:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error occurred"));
          setMembers([]);
          setMemberCount(0);
          setLoading(false);
        }
      }
    }

    fetchMembers();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [groupAddress]);

  return { members, memberCount, loading, error };
}
