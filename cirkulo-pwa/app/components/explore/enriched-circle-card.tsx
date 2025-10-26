import { CircleCard, type CircleCardProps } from "./circle-card";
import { useCircleContractData } from "app/hooks/use-enriched-circles";
import type { Circle } from "app/types/feed";

export interface EnrichedCircleCardProps extends Omit<CircleCardProps, "circle"> {
  circle: Circle;
  isUserMember?: boolean;
  isJoining?: boolean;
}

/**
 * Wrapper around CircleCard that enriches circle data with contract amounts
 * Reads totalRaised and goalAmount from the DonationPool contract
 */
export function EnrichedCircleCard({ circle, isUserMember = false, isJoining = false, ...props }: EnrichedCircleCardProps) {
  // Read contract data for this circle
  const { currentAmount, goalAmount, progress, isLoading } = useCircleContractData(circle.poolAddress);

  // If contract data is still loading, show circle with placeholder values
  // Once loaded, override with real contract amounts
  const enrichedCircle: Circle = {
    ...circle,
    currentAmount: isLoading ? circle.currentAmount : currentAmount,
    goalAmount: isLoading ? circle.goalAmount : goalAmount,
    progress: isLoading ? circle.progress : progress,
  };

  return <CircleCard circle={enrichedCircle} isUserMember={isUserMember} isJoining={isJoining} {...props} />;
}
