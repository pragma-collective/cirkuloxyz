import { useState, useCallback } from "react";
import {
  useSendTransaction as useWagmiSendTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useSwitchChain
} from "wagmi";
import { parseEther, type Address } from "viem";
import type { SendTransactionFormData } from "~/schemas/send-transaction-schema";
import { citreaTestnet } from "~/lib/wagmi";
import { erc20Abi, getMockCUSDAddress } from "~/lib/abi";

type TransactionStatus = "idle" | "processing" | "success" | "error";

/**
 * Hook for sending blockchain transactions on Citrea testnet
 * Supports both CBTC (native token) and CUSD (ERC20 token) transfers
 */
export function useSendTransaction() {
  const { address: userAddress, chain } = useAccount();
  const { sendTransactionAsync } = useWagmiSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<Address | undefined>();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
    chainId: citreaTestnet.id,
  });

  // When transaction is confirmed, update status
  if (isConfirmed && status === "processing") {
    setStatus("success");
  }

  const sendTransaction = useCallback(async (data: SendTransactionFormData) => {
    if (!userAddress) {
      setError("No wallet connected");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setError(null);
    setTxHash(null);
    setPendingTxHash(undefined);

    try {
      // Ensure we're on Citrea testnet
      if (chain?.id !== citreaTestnet.id) {
        console.log("[useSendTransaction] Switching to Citrea testnet...");
        await switchChainAsync({ chainId: citreaTestnet.id });
      }

      const recipientAddress = data.recipient as Address;
      let hash: Address;

      if (data.token === "CBTC") {
        // Send native CBTC token
        console.log("[useSendTransaction] Sending CBTC:", {
          to: recipientAddress,
          amount: data.amount,
        });

        hash = await sendTransactionAsync({
          to: recipientAddress,
          value: parseEther(data.amount),
          chainId: citreaTestnet.id,
        });
      } else {
        // Send CUSD ERC20 token
        const cusdAddress = getMockCUSDAddress();

        console.log("[useSendTransaction] Sending CUSD:", {
          token: cusdAddress,
          to: recipientAddress,
          amount: data.amount,
        });

        hash = await writeContractAsync({
          address: cusdAddress,
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipientAddress, parseEther(data.amount)],
          chainId: citreaTestnet.id,
        });
      }

      console.log("[useSendTransaction] Transaction submitted:", hash);
      setTxHash(hash);
      setPendingTxHash(hash);

      // Status will be updated to "success" when isConfirmed becomes true

    } catch (err) {
      console.error("[useSendTransaction] Error:", err);

      let errorMessage = "Transaction failed";

      if (err instanceof Error) {
        // Parse common error messages
        if (err.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected";
        } else if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction + gas";
        } else if (err.message.includes("gas required exceeds allowance")) {
          errorMessage = "Insufficient funds for gas";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setStatus("error");
    }
  }, [userAddress, chain, sendTransactionAsync, writeContractAsync, switchChainAsync, status]);

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
    setPendingTxHash(undefined);
  }, []);

  return {
    sendTransaction,
    status,
    txHash,
    error,
    reset,
    isConfirming, // Expose confirmation state
  };
}
