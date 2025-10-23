/**
 * Hook for contributing to a circle pool
 * Handles three pool types: Savings (deposit), ROSCA (contribute), Donation (donate)
 * Manages ERC20 approval for CUSD contributions
 */

import { useState, useCallback, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useSwitchChain } from "wagmi";
import { parseEther, type Address } from "viem";
import { citreaTestnet } from "app/lib/wagmi";
import { getPoolAbi, getContributeFunctionName, erc20Abi } from "app/lib/pool-abis";
import { getMockCUSDAddress } from "app/lib/abi";

interface ContributeParams {
  poolAddress: Address;
  circleType: "contribution" | "rotating" | "fundraising";
  currency: "cusd" | "cbtc";
  amount?: string; // Optional for ROSCA (uses fixed amount)
  fixedAmount?: bigint; // For ROSCA - the fixed contribution amount
}

interface ContributeResult {
  contribute: (params: ContributeParams) => Promise<{ success: boolean; error?: string }>;
  approve: (poolAddress: Address, amount: bigint) => Promise<{ success: boolean; error?: string }>;
  checkApproval: (poolAddress: Address, amount: bigint) => Promise<boolean>;
  isContributing: boolean;
  isApproving: boolean;
  isConfirming: boolean; // New: waiting for tx confirmation
  isApprovalConfirmed: boolean; // New: approval tx confirmed on-chain
  error: Error | null;
  isSuccess: boolean;
  txHash?: Address;
  approvalTxHash?: Address;
  contributeTxHash?: Address;
}

export function useContribute(): ContributeResult {
  const { address: userAddress, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const [isContributing, setIsContributing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<Address | undefined>();
  const [approvalTxHash, setApprovalTxHash] = useState<Address | undefined>();
  const [contributeTxHash, setContributeTxHash] = useState<Address | undefined>();

  // Wait for approval transaction confirmation
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  });

  // Wait for contribute transaction confirmation
  const { isLoading: isContributeConfirming, isSuccess: isContributeConfirmed } = useWaitForTransactionReceipt({
    hash: contributeTxHash,
  });

  const isConfirming = isApprovalConfirming || isContributeConfirming;

  /**
   * Check if user has approved the pool to spend CUSD
   */
  const checkApproval = useCallback(
    async (poolAddress: Address, amount: bigint): Promise<boolean> => {
      if (!userAddress) return false;

      try {
        const cusdAddress = getMockCUSDAddress();

        // Read allowance from CUSD contract
        const { data } = useReadContract({
          address: cusdAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [userAddress, poolAddress],
        });

        const allowance = data as bigint | undefined;
        return allowance ? allowance >= amount : false;
      } catch (err) {
        console.error("[useContribute] Error checking approval:", err);
        return false;
      }
    },
    [userAddress]
  );

  /**
   * Approve pool contract to spend CUSD
   */
  const approve = useCallback(
    async (poolAddress: Address, amount: bigint): Promise<{ success: boolean; error?: string }> => {
      if (!userAddress) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsApproving(true);
      setError(null);
      setApprovalTxHash(undefined);

      try {
        // Switch to Citrea network if not already on it
        if (chain?.id !== citreaTestnet.id) {
          console.log("[useContribute] Switching to Citrea network...");
          await switchChainAsync({ chainId: citreaTestnet.id });
        }

        const cusdAddress = getMockCUSDAddress();

        console.log("[useContribute] Approving CUSD:", {
          cusdAddress,
          poolAddress,
          amount: amount.toString(),
        });

        const hash = await writeContractAsync({
          address: cusdAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [poolAddress, amount],
          chain: citreaTestnet,
          chainId: citreaTestnet.id,
        });

        console.log("[useContribute] Approval transaction sent:", hash);
        setApprovalTxHash(hash);
        setTxHash(hash);

        // Transaction sent successfully, now wait for confirmation
        // useWaitForTransactionReceipt hook will handle the waiting
        return { success: true };
      } catch (err) {
        console.error("[useContribute] Approval failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to approve CUSD";
        setError(err instanceof Error ? err : new Error(errorMessage));
        setIsApproving(false);
        setApprovalTxHash(undefined);
        return { success: false, error: errorMessage };
      }
    },
    [userAddress, chain, writeContractAsync, switchChainAsync]
  );

  // Reset approval state when confirmation completes
  useEffect(() => {
    if (isApprovalConfirmed && isApproving) {
      console.log("[useContribute] Approval confirmed on-chain");
      setIsApproving(false);
    }
  }, [isApprovalConfirmed, isApproving]);

  /**
   * Contribute to the pool
   */
  const contribute = useCallback(
    async (params: ContributeParams): Promise<{ success: boolean; error?: string }> => {
      const { poolAddress, circleType, currency, amount, fixedAmount } = params;

      if (!userAddress) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsContributing(true);
      setError(null);
      setIsSuccess(false);
      setContributeTxHash(undefined);

      try {
        // Switch to Citrea network if not already on it
        if (chain?.id !== citreaTestnet.id) {
          console.log("[useContribute] Switching to Citrea network...");
          await switchChainAsync({ chainId: citreaTestnet.id });
        }

        const abi = getPoolAbi(circleType);
        const functionName = getContributeFunctionName(circleType);
        const isNativeToken = currency === "cbtc";

        let contributionAmount: bigint;
        let args: any[] = [];
        let value: bigint | undefined;

        // Handle different pool types
        if (circleType === "rotating") {
          // ROSCA: Fixed amount, no user input
          if (!fixedAmount) {
            throw new Error("Fixed contribution amount is required for ROSCA");
          }
          contributionAmount = fixedAmount;

          // No args for contribute()
          args = [];
        } else {
          // Savings or Donation: User-specified amount
          if (!amount) {
            throw new Error("Amount is required");
          }
          contributionAmount = parseEther(amount);

          // Args for deposit() or donate()
          args = isNativeToken ? [0n] : [contributionAmount];
        }

        // Set msg.value for native token contributions
        if (isNativeToken) {
          value = contributionAmount;
        }

        console.log("[useContribute] Contributing:", {
          poolAddress,
          functionName,
          args,
          value: value?.toString(),
          circleType,
          currency,
        });

        const hash = await writeContractAsync({
          address: poolAddress,
          abi,
          functionName: functionName as any,
          args,
          value,
          chain: citreaTestnet,
          chainId: citreaTestnet.id,
        });

        console.log("[useContribute] Contribution transaction sent:", hash);
        setContributeTxHash(hash);
        setTxHash(hash);

        // Transaction sent successfully, now wait for confirmation
        // useWaitForTransactionReceipt hook will handle the waiting
        return { success: true };
      } catch (err) {
        console.error("[useContribute] Contribution failed:", err);

        // Parse error messages for user-friendly display
        let errorMessage = "Failed to contribute";
        if (err instanceof Error) {
          if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient balance";
          } else if (err.message.includes("user rejected")) {
            errorMessage = "Transaction rejected";
          } else if (err.message.includes("Already contributed")) {
            errorMessage = "You have already contributed for this round";
          } else if (err.message.includes("Deadline passed")) {
            errorMessage = "Fundraising deadline has passed";
          } else if (err.message.includes("Pool not active")) {
            errorMessage = "This pool is not active";
          } else {
            errorMessage = err.message;
          }
        }

        setError(new Error(errorMessage));
        setIsContributing(false);
        setContributeTxHash(undefined);
        return { success: false, error: errorMessage };
      }
    },
    [userAddress, chain, writeContractAsync, switchChainAsync]
  );

  // Mark as success when contribute tx confirms
  useEffect(() => {
    if (isContributeConfirmed && isContributing) {
      console.log("[useContribute] Contribution confirmed on-chain");
      setIsContributing(false);
      setIsSuccess(true);
    }
  }, [isContributeConfirmed, isContributing]);

  return {
    contribute,
    approve,
    checkApproval,
    isContributing,
    isApproving,
    isConfirming,
    isApprovalConfirmed,
    error,
    isSuccess,
    txHash,
    approvalTxHash,
    contributeTxHash,
  };
}
