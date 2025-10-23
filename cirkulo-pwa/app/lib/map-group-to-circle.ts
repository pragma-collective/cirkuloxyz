import type { Group } from "@lens-protocol/client";
import type { Circle } from "app/types/feed";
import type { FetchCircleResponse } from "~/hooks/use-fetch-circle";

/**
 * Maps a Lens Protocol Group to the application's Circle type
 *
 * Now integrates with API data to provide real circle configuration including:
 * - Circle name (non-slugified) from database
 * - Circle type (contribution/rotating/fundraising) from database
 * - Goal amounts and current progress (from smart contracts - TODO)
 * - Member details and counts (from Lens group - TODO)
 *
 * @param group - Lens Protocol Group object
 * @param apiCircleData - Optional circle data from API database
 * @returns Circle object compatible with the app
 */
export function mapGroupToCircle(
  group: Group,
  apiCircleData?: FetchCircleResponse['data']
): Circle {
  // Use API data if available, otherwise fallback to Lens metadata
  const name = apiCircleData?.circleName || group.metadata?.name || `Group ${group.address.slice(0, 8)}...`;
  const description = group.metadata?.description || "No description available";
  const circleType = apiCircleData?.circleType || "contribution";

  // Determine if public based on circle type (fundraising circles are public)
  const isPublic = circleType === "fundraising";

  // Create circle object merging Lens Group + API data
  const circle: Circle = {
    id: group.address,
    name, // Real name from API!
    description,
    circleType, // Real type from API!
    contributionSchedule: "monthly",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // Default 30 days - TODO: from contract
    goalName: name,
    goalAmount: 10000, // Default goal amount - TODO: from contract
    currentAmount: 0, // TODO: from smart contract
    memberCount: 0, // TODO: from group members query
    progress: 0,
    members: [], // TODO: separate query to fetch members
    isPublic,
    category: "other",
    createdAt: apiCircleData?.createdAt || (group.timestamp ? new Date(group.timestamp).toISOString() : new Date().toISOString()),
    isActive: true,
    poolAddress: apiCircleData?.poolAddress, // Pool contract address from API
    currency: apiCircleData?.currency || "cusd", // Currency from API
  };

  return circle;
}
