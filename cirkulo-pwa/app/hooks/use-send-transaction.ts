import { useState, useCallback } from "react";
import type { SendTransactionFormData } from "~/schemas/send-transaction-schema";

type TransactionStatus = "idle" | "processing" | "success" | "error";

/**
 * Hook for sending blockchain transactions
 * TODO: Replace with real blockchain transaction via wagmi/viem
 */
export function useSendTransaction() {
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = useCallback(async (data: SendTransactionFormData) => {
    setStatus("processing");
    setError(null);
    setTxHash(null);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock success (90% success rate for demo)
      if (Math.random() > 0.1) {
        // Generate mock transaction hash
        const mockHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`.substring(0, 66);
        setTxHash(mockHash);
        setStatus("success");
      } else {
        throw new Error("Network error. Please try again.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return {
    sendTransaction,
    status,
    txHash,
    error,
    reset,
  };
}
