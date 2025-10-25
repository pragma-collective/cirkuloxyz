import { useState, useEffect } from "react";
import { useAuth } from "~/context/auth-context";

export interface Transaction {
  txHash: string;
  type: "send" | "receive";
  amount: string;
  token: "CBTC" | "CUSD";
  counterparty: string; // Address
  timestamp: string; // ISO string
  status: "confirmed" | "pending" | "failed";
}

/**
 * Hook to fetch transaction history for the connected wallet
 * Currently uses mock data. Future: integrate with blockchain explorer API
 *
 * @param limit - Number of transactions to fetch (default: 5)
 * @returns Transaction list, loading state
 */
export function useTransactions(limit: number = 5) {
  const { user } = useAuth();
  const walletAddress = user?.walletAddress;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    async function fetchTransactions() {
      try {
        setIsLoading(true);

        // TODO: Replace with actual blockchain explorer API calls
        // - Query Citrea testnet for transactions involving walletAddress
        // - Sort by timestamp (newest first)
        // - Limit to `limit` items
        // Example: Use Citrea explorer API or index transaction logs

        // Mock data for now
        await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay

        const mockTransactions: Transaction[] = [
          {
            txHash: "0x7b3c4d2f8a1e5b9c6f0d3a8e7b2c5f1a9d4e8c3b7a6f2e1d9c8b5a4f3e2d1c0b",
            type: "receive",
            amount: "0.0012",
            token: "CBTC",
            counterparty: "0x7B3c4D2F8A1E5B9C6F0D3A8E7B2C5F1A9D4E8C3B",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            status: "confirmed",
          },
          {
            txHash: "0x9f2a3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
            type: "send",
            amount: "0.0008",
            token: "CBTC",
            counterparty: "0x9F2A3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
            status: "confirmed",
          },
          {
            txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
            type: "receive",
            amount: "25.00",
            token: "CUSD",
            counterparty: "0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            status: "confirmed",
          },
        ];

        setTransactions(mockTransactions.slice(0, limit));
      } catch (err) {
        console.error("[useTransactions] Error:", err);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();

    // Poll every 60 seconds for new transactions
    const interval = setInterval(fetchTransactions, 60000);
    return () => clearInterval(interval);
  }, [walletAddress, limit]);

  return { transactions, isLoading };
}
