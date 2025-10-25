import { useCallback } from "react";

/**
 * Hook for token price conversion
 * TODO: Replace with real-time price feed from API/oracle
 */
export function useTokenPrice(token: "CBTC" | "CUSD") {
  // Mock prices
  const prices = {
    CBTC: 80645.23, // Mock Bitcoin price
    CUSD: 1.0, // Stablecoin pegged to USD
  };

  const convertToUSD = useCallback(
    (amount: string | number): number => {
      const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
      return num * prices[token];
    },
    [token, prices]
  );

  const formatUSD = useCallback(
    (amount: string | number): string => {
      const usdValue = convertToUSD(amount);
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdValue);
    },
    [convertToUSD]
  );

  return {
    price: prices[token],
    convertToUSD,
    formatUSD,
  };
}
