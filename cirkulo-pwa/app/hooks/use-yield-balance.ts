/**
 * Hook for fetching yield balance data from YieldSavingsPool
 * Supports both member-specific queries and pool-level statistics
 */

import { useReadContract } from "wagmi";
import { type Address } from "viem";
import { citreaTestnet } from "app/lib/wagmi";
import { savingsPoolAbi } from "app/lib/pool-abis";

export interface YieldBalanceResult {
  /** Member's principal balance (original deposits, no yield) */
  principal: bigint;
  /** Member's total balance (principal + yield) */
  totalBalance: bigint;
  /** Member's yield earned */
  yieldEarned: bigint;
  /** Member's yield percentage (e.g., 5.2 for 5.2% return) */
  yieldPercentage: number;
  /** Pool's APY rate (e.g., 500 = 5.00%, 300 = 3.00%) */
  apy: number;
  /** Total principal deposited in pool */
  poolTotalPrincipal: bigint;
  /** Total yield earned by pool */
  poolTotalYield: bigint;
  /** Total pool value (principal + yield) */
  poolTotalValue: bigint;
  /** Is data loading */
  isLoading: boolean;
  /** Is there an error */
  isError: boolean;
}

/**
 * Fetches yield balance data for a member in a YieldSavingsPool
 *
 * @param poolAddress Address of the YieldSavingsPool contract
 * @param memberAddress Address of the member (use "0x0" for pool-level queries only)
 * @param currency Currency type ("cusd" or "cbtc") - determines expected APY
 * @returns YieldBalanceResult with all yield-related data
 *
 * @example
 * // Get member's yield data
 * const { principal, totalBalance, yieldEarned, apy } = useYieldBalance(
 *   poolAddress,
 *   userAddress,
 *   "cusd"
 * );
 *
 * @example
 * // Get only pool-level stats (no specific member)
 * const { poolTotalPrincipal, poolTotalYield, apy } = useYieldBalance(
 *   poolAddress,
 *   "0x0",
 *   "cbtc"
 * );
 */
export function useYieldBalance(
  poolAddress: Address | undefined,
  memberAddress: Address | "0x0" | undefined,
  currency: "cusd" | "cbtc"
): YieldBalanceResult {
  const isPoolQuery = memberAddress === "0x0";
  const shouldQueryMember = !isPoolQuery && !!memberAddress && !!poolAddress;

  // Query member's principal balance
  const { data: principal, isLoading: isLoadingPrincipal, isError: isErrorPrincipal } = useReadContract({
    address: poolAddress,
    abi: savingsPoolAbi,
    functionName: "principalBalances",
    args: memberAddress && memberAddress !== "0x0" ? [memberAddress] : undefined,
    query: { enabled: shouldQueryMember },
    chainId: citreaTestnet.id,
  });

  // Query member's balance with yield
  const { data: totalBalance, isLoading: isLoadingBalance, isError: isErrorBalance } = useReadContract({
    address: poolAddress,
    abi: savingsPoolAbi,
    functionName: "getBalanceWithYield",
    args: memberAddress && memberAddress !== "0x0" ? [memberAddress] : undefined,
    query: { enabled: shouldQueryMember },
    chainId: citreaTestnet.id,
  });

  // Query member's yield earned
  const { data: yieldEarned, isLoading: isLoadingYield, isError: isErrorYield } = useReadContract({
    address: poolAddress,
    abi: savingsPoolAbi,
    functionName: "getYieldEarned",
    args: memberAddress && memberAddress !== "0x0" ? [memberAddress] : undefined,
    query: { enabled: shouldQueryMember },
    chainId: citreaTestnet.id,
  });

  // Always query pool stats
  const { data: poolStats, isLoading: isLoadingPoolStats, isError: isErrorPoolStats } = useReadContract({
    address: poolAddress,
    abi: savingsPoolAbi,
    functionName: "getPoolStats",
    query: { enabled: !!poolAddress },
    chainId: citreaTestnet.id,
  });

  // Query APY from contract
  const { data: contractAPY, isLoading: isLoadingAPY, isError: isErrorAPY } = useReadContract({
    address: poolAddress,
    abi: savingsPoolAbi,
    functionName: "getAPY",
    query: { enabled: !!poolAddress },
    chainId: citreaTestnet.id,
  });

  // Calculate yield percentage for member
  const yieldPercentage =
    principal && principal > 0n && yieldEarned
      ? (Number(yieldEarned) / Number(principal)) * 100
      : 0;

  // Convert APY from contract format (500 = 5.00%) to decimal (5.0)
  const apy = contractAPY ? Number(contractAPY) / 100 : (currency === "cbtc" ? 3.0 : 5.0);

  // Aggregate loading and error states
  const isLoading =
    isLoadingPrincipal ||
    isLoadingBalance ||
    isLoadingYield ||
    isLoadingPoolStats ||
    isLoadingAPY;

  const isError =
    isErrorPrincipal ||
    isErrorBalance ||
    isErrorYield ||
    isErrorPoolStats ||
    isErrorAPY;

  return {
    principal: principal || 0n,
    totalBalance: totalBalance || 0n,
    yieldEarned: yieldEarned || 0n,
    yieldPercentage,
    apy,
    poolTotalPrincipal: poolStats?.[0] || 0n,
    poolTotalYield: poolStats?.[1] || 0n,
    poolTotalValue: poolStats?.[2] || 0n,
    isLoading,
    isError,
  };
}
