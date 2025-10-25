import { useState, useEffect } from "react";
import { useAuth } from "~/context/auth-context";

export interface AssetBalance {
  amount: string;
  usdValue: string;
}

export interface WalletBalances {
  cbtc: AssetBalance;
  cusd: AssetBalance;
  total: string; // Total USD value
}

/**
 * Hook to fetch wallet balances for CBTC and CUSD
 * Currently uses mock data. Future: integrate with wagmi/viem to read from contracts
 *
 * @returns Wallet balances, loading state, and error state
 */
export function useWalletBalances() {
  const { user } = useAuth();
  const walletAddress = user?.walletAddress;
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setBalances(null);
      setIsLoading(false);
      return;
    }

    async function fetchBalances() {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual blockchain calls
        // - Read CBTC balance (native token on Citrea)
        // - Read CUSD balance (ERC20 contract)
        // - Fetch current prices from API or oracle
        // Example using wagmi:
        // const { data: cbtcBalance } = useBalance({ address: walletAddress })
        // const { data: cusdBalance } = useReadContract({
        //   address: CUSD_CONTRACT_ADDRESS,
        //   abi: erc20Abi,
        //   functionName: 'balanceOf',
        //   args: [walletAddress]
        // })

        // Mock data for now
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

        const mockBalances: WalletBalances = {
          cbtc: {
            amount: "0.0024",
            usdValue: "145.80",
          },
          cusd: {
            amount: "50.00",
            usdValue: "50.00",
          },
          total: "195.80",
        };

        setBalances(mockBalances);
      } catch (err) {
        console.error("[useWalletBalances] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch balances");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBalances();

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  return { balances, isLoading, error };
}
