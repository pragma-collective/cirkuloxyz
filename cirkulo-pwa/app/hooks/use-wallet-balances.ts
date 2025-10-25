import { useState, useEffect } from "react";
import { getBalance, readContract } from "wagmi/actions";
import { formatUnits } from "viem";
import { useAuth } from "~/context/auth-context";
import { wagmiConfig, citreaTestnet } from "~/lib/wagmi";
import { erc20Abi, getMockCUSDAddress } from "~/lib/abi";

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
 * - CBTC: Fetches actual balance from Citrea testnet
 * - CUSD: Fetches actual balance from ERC20 contract on Citrea testnet
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

        console.log("[useWalletBalances] Fetching balance for:", walletAddress);

        // Fetch actual cBTC balance from Citrea testnet
        const cbtcBalance = await getBalance(wagmiConfig, {
          address: walletAddress as `0x${string}`,
          chainId: citreaTestnet.id,
        });

        // Convert from Wei (18 decimals) to cBTC
        const cbtcAmount = formatUnits(cbtcBalance.value, 18);

        console.log("[useWalletBalances] cBTC balance:", cbtcAmount);

        // BTC price (updated to current market price)
        const btcPriceUSD = 111652.80;
        const cbtcUsdValue = (parseFloat(cbtcAmount) * btcPriceUSD).toFixed(2);

        // Fetch actual CUSD balance from ERC20 contract
        const cusdContractAddress = getMockCUSDAddress();
        const cusdBalance = await readContract(wagmiConfig, {
          address: cusdContractAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [walletAddress as `0x${string}`],
          chainId: citreaTestnet.id,
        });

        // Convert from Wei (18 decimals) to CUSD
        const cusdAmount = formatUnits(cusdBalance, 18);

        console.log("[useWalletBalances] CUSD balance:", cusdAmount);

        // CUSD is a stablecoin pegged 1:1 with USD
        const cusdUsdValue = parseFloat(cusdAmount).toFixed(2);

        const totalUsdValue = (
          parseFloat(cbtcUsdValue) + parseFloat(cusdUsdValue)
        ).toFixed(2);

        const fetchedBalances: WalletBalances = {
          cbtc: {
            amount: parseFloat(cbtcAmount).toFixed(8), // Show 8 decimals for Bitcoin
            usdValue: cbtcUsdValue,
          },
          cusd: {
            amount: parseFloat(cusdAmount).toFixed(2), // Show 2 decimals for stablecoin
            usdValue: cusdUsdValue,
          },
          total: totalUsdValue,
        };

        setBalances(fetchedBalances);
      } catch (err) {
        console.error("[useWalletBalances] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch balances");

        // Set zero balances on error to show something to user
        setBalances({
          cbtc: { amount: "0.00000000", usdValue: "0.00" },
          cusd: { amount: "0.00", usdValue: "0.00" },
          total: "0.00",
        });
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
