import type { Group } from "@lens-protocol/client";
import type { Circle } from "app/types/feed";

/**
 * Maps a Lens Protocol Group to the application's Circle type
 * 
 * NOTE: This is a temporary implementation. In the future, this data will come from our API
 * which will provide the full circle configuration including:
 * - Saving type and contribution schedule
 * - Goal amounts and current progress (from smart contracts)
 * - Member details and counts
 * - Circle-specific settings and metadata
 * 
 * @param group - Lens Protocol Group object
 * @returns Circle object compatible with the app
 */
export function mapGroupToCircle(group: Group): Circle {
  // Extract name and description from metadata
  const name = group.metadata?.name || `Group ${group.address.slice(0, 8)}...`;
  const description = group.metadata?.description || "No description available";

  // Create circle object with available data from Lens Group
  const circle: Circle = {
    id: group.address,
    name,
    description,
    // Default values - these would ideally come from your smart contract or additional metadata
    savingType: "contribution",
    contributionSchedule: "monthly",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // Default 30 days
    goalName: name,
    goalAmount: 10000, // Default goal amount
    currentAmount: 0, // Would come from smart contract
    memberCount: 0, // Would come from group members query
    progress: 0,
    members: [], // Would need separate query to fetch members
    isPublic: false,
    category: "other",
    createdAt: group.timestamp ? new Date(group.timestamp).toISOString() : new Date().toISOString(),
    isActive: true,
  };

  return circle;
}
