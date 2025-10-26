import { useState, useEffect, useCallback } from "react";
import { apiRequest, ApiError } from "app/lib/api-client";
import type { CircleCategory } from "app/types/feed";

// API response type from backend
interface ApiCircle {
  id: string;
  circleName: string;
  poolAddress: string;
  lensGroupAddress: string;
  poolDeploymentTxHash: string | null;
  circleType: "contribution" | "rotating" | "fundraising";
  currency: "cusd" | "cbtc";
  categories: string[] | null;
  creatorAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface PublicCirclesResponse {
  success: boolean;
  data: ApiCircle[];
}

interface UsePublicCirclesOptions {
  category?: CircleCategory;
  excludeUser?: string;
  onlyUser?: string;
}

interface UsePublicCirclesResult {
  circles: ApiCircle[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch public fundraising circles from the API
 * @param category - Optional category filter
 * @param excludeUser - Optional user address to exclude their circles
 * @param onlyUser - Optional user address to only show their circles
 * @returns Circle data, loading state, and error state
 */
export async function fetchPublicCircles(
  category?: CircleCategory,
  excludeUser?: string,
  onlyUser?: string
): Promise<ApiCircle[]> {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (excludeUser) params.append("exclude_user", excludeUser);
  if (onlyUser) params.append("only_user", onlyUser);

  const queryString = params.toString();
  const endpoint = `/circles/explore${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<PublicCirclesResponse>(endpoint, {
    requiresAuth: false, // Public endpoint
    method: "GET",
  });

  return response.data;
}

/**
 * Custom hook to fetch and manage public circles
 */
export function usePublicCircles(
  options: UsePublicCirclesOptions = {}
): UsePublicCirclesResult {
  const { category, excludeUser, onlyUser } = options;

  const [circles, setCircles] = useState<ApiCircle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCircles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPublicCircles(category, excludeUser, onlyUser);
      setCircles(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : "Failed to fetch public circles";
      setError(new Error(errorMessage));
      console.error("[usePublicCircles] Error fetching circles:", err);
    } finally {
      setIsLoading(false);
    }
  }, [category, excludeUser, onlyUser]);

  useEffect(() => {
    fetchCircles();
  }, [fetchCircles]);

  return {
    circles,
    isLoading,
    error,
    refetch: fetchCircles,
  };
}
