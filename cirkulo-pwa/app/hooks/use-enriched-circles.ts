import { useState, useEffect, useMemo } from "react";
import { fetchPublicCircles } from "./use-public-circles";
import { fetchGroup, fetchGroupMembers } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { lensClient } from "app/lib/lens";
import { useReadContract } from "wagmi";
import { donationPoolAbi } from "app/lib/pool-abis";
import type { Circle, CircleCategory } from "app/types/feed";
import type { User } from "app/context/auth-context";

interface EnrichedCirclesOptions {
  category?: CircleCategory;
  excludeUser?: string;
  onlyUser?: string;
}

/**
 * Enriches a single circle with Lens group data and contract data
 */
async function enrichCircle(apiCircle: any): Promise<Circle | null> {
  try {
    console.log("[EnrichCircle] Processing circle:", apiCircle.circleName, apiCircle.lensGroupAddress);

    // Validate lens group address
    if (!apiCircle.lensGroupAddress || typeof apiCircle.lensGroupAddress !== 'string') {
      console.error("[EnrichCircle] Invalid lensGroupAddress:", apiCircle.lensGroupAddress);
      return null;
    }

    // 1. Fetch Lens group metadata
    const groupResult = await fetchGroup(lensClient, {
      group: evmAddress(apiCircle.lensGroupAddress),
    });

    if (groupResult.isErr()) {
      console.error("[EnrichCircle] Failed to fetch group:", groupResult.error);
      return null;
    }

    const group = groupResult.value;

    // 2. Fetch group members
    const membersResult = await fetchGroupMembers(lensClient, {
      group: evmAddress(apiCircle.lensGroupAddress),
    });

    if (membersResult.isErr()) {
      console.error("[EnrichCircle] Failed to fetch members:", membersResult.error);
      return null;
    }

    const members = membersResult.value.items;
    const memberCount = members.length;

    // Convert first 3-4 Lens members to User type for avatars
    const memberUsers: User[] = members.slice(0, 4).map((member) => ({
      id: member.account.address,
      name: member.account.metadata?.name || member.account.username?.localName || "Unknown",
      lensUsername: member.account.username?.localName,
      hasLensAccount: true,
      lensAccounts: [],
    }));

    // Extract metadata from Lens group
    const emoji = group.metadata?.icon || group.metadata?.attributes?.find((attr: any) => attr.key === "emoji")?.value || "🎯";
    const goalName = group.metadata?.description || group.metadata?.attributes?.find((attr: any) => attr.key === "goalName")?.value || "Fundraising Goal";

    // 3. Contract data will be fetched separately in the component using useReadContract
    // We return placeholder values here, component will override with real data
    return {
      id: apiCircle.id,
      name: apiCircle.circleName,
      emoji,
      description: group.metadata?.description,
      circleType: apiCircle.circleType,
      currency: apiCircle.currency,
      poolAddress: apiCircle.poolAddress,
      lensGroupAddress: apiCircle.lensGroupAddress,
      contributionSchedule: "monthly", // Default, can be stored in metadata
      endDate: null,
      goalName,
      goalAmount: 0, // Will be filled by contract read
      currentAmount: 0, // Will be filled by contract read
      memberCount,
      progress: 0, // Will be calculated after contract read
      members: memberUsers,
      isPublic: true,
      categories: apiCircle.categories,
      createdAt: apiCircle.createdAt,
      isActive: true,
    };
  } catch (error) {
    console.error("[EnrichCircle] Error enriching circle:", error);
    return null;
  }
}

/**
 * Hook to fetch public circles enriched with Lens and contract data
 */
export function useEnrichedCircles(options: EnrichedCirclesOptions = {}) {
  const { category, excludeUser, onlyUser } = options;
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCircles() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch base circle data from API (already filtered by backend)
        const apiCircles = await fetchPublicCircles(category, excludeUser, onlyUser);
        console.log("[useEnrichedCircles] Fetched", apiCircles.length, "circles from API");

        if (apiCircles.length === 0) {
          console.log("[useEnrichedCircles] No circles found in API");
          if (isMounted) {
            setCircles([]);
          }
          return;
        }

        // 2. Enrich each circle with Lens data (parallel)
        const enrichPromises = apiCircles.map((circle) => enrichCircle(circle));
        const enrichedResults = await Promise.all(enrichPromises);

        // Filter out null results (failed enrichments)
        const validCircles = enrichedResults.filter((c): c is Circle => c !== null);

        if (isMounted) {
          console.log("[useEnrichedCircles] Successfully enriched", validCircles.length, "out of", apiCircles.length, "circles");
          setCircles(validCircles);
        }
      } catch (err) {
        console.error("[useEnrichedCircles] Error loading circles:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load circles"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCircles();

    return () => {
      isMounted = false;
    };
  }, [category, excludeUser, onlyUser]);

  return { circles, isLoading, error };
}

/**
 * Hook to read contract data for a specific circle
 * Returns the contract amounts (totalRaised, goalAmount)
 */
export function useCircleContractData(poolAddress?: string) {
  const { data: totalRaised } = useReadContract({
    address: poolAddress as `0x${string}` | undefined,
    abi: donationPoolAbi,
    functionName: "totalRaised",
    query: {
      enabled: !!poolAddress,
    },
  });

  const { data: goalAmount } = useReadContract({
    address: poolAddress as `0x${string}` | undefined,
    abi: donationPoolAbi,
    functionName: "goalAmount",
    query: {
      enabled: !!poolAddress,
    },
  });

  const currentAmount = totalRaised ? Number(totalRaised) / 1e18 : 0; // Convert from wei to normal units
  const goal = goalAmount ? Number(goalAmount) / 1e18 : 0;
  const progress = goal > 0 ? Math.min(Math.round((currentAmount / goal) * 100), 100) : 0;

  return {
    currentAmount,
    goalAmount: goal,
    progress,
    isLoading: totalRaised === undefined || goalAmount === undefined,
  };
}
