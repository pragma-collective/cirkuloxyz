import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { formatUnits } from "viem";
import { useAuth } from "~/context/auth-context";
import { wagmiConfig, citreaTestnet } from "~/lib/wagmi";
import { erc20Abi } from "~/lib/pool-abis";

// Hardcoded receipt token addresses
const XSHCUSD_ADDRESS = "0xD610138F66B4645E31E3C434131558eE8D18165c" as const;
const XSHCBTC_ADDRESS = "0x71111195804E8774FF8C927D692bfbc1DD65cEB5" as const;

export interface ReceiptTokenBalance {
  amount: string; // Formatted amount (e.g., "10.00")
  rawAmount: bigint; // Raw wei amount
  usdValue: string; // USD value
}

export interface ReceiptTokenBalances {
  xshCUSD: ReceiptTokenBalance;
  xshCBTC: ReceiptTokenBalance;
  totalUsdValue: string; // Combined USD value
}

/**
 * Hook to fetch receipt token balances (xshCUSD and xshCBTC)
 * Receipt tokens represent deposits in YieldSavingsPools
 *
 * @returns Receipt token balances, loading state, and error
 */
export function useReceiptTokenBalances() {
  const { user } = useAuth();
  const walletAddress = user?.walletAddress;
  const [balances, setBalances] = useState<ReceiptTokenBalances | null>(null);
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

        console.log("[useReceiptTokenBalances] Fetching for:", walletAddress);

        // Fetch xshCUSD balance
        const xshCUSDBalance = await readContract(wagmiConfig, {
          address: XSHCUSD_ADDRESS,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [walletAddress as `0x${string}`],
          chainId: citreaTestnet.id,
        });

        // Fetch xshCBTC balance
        const xshCBTCBalance = await readContract(wagmiConfig, {
          address: XSHCBTC_ADDRESS,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [walletAddress as `0x${string}`],
          chainId: citreaTestnet.id,
        });

        // Format balances
        const xshCUSDAmount = formatUnits(xshCUSDBalance, 18);
        const xshCBTCAmount = formatUnits(xshCBTCBalance, 18);

        console.log("[useReceiptTokenBalances] xshCUSD:", xshCUSDAmount);
        console.log("[useReceiptTokenBalances] xshCBTC:", xshCBTCAmount);

        // Calculate USD values
        // xshCUSD: 1:1 with USD (stablecoin)
        const xshCUSDUsdValue = parseFloat(xshCUSDAmount).toFixed(2);

        // xshCBTC: Hardcoded BTC price for now
        const btcPriceUSD = 111652.80;
        const xshCBTCUsdValue = (parseFloat(xshCBTCAmount) * btcPriceUSD).toFixed(2);

        const totalUsdValue = (
          parseFloat(xshCUSDUsdValue) + parseFloat(xshCBTCUsdValue)
        ).toFixed(2);

        const fetchedBalances: ReceiptTokenBalances = {
          xshCUSD: {
            amount: parseFloat(xshCUSDAmount).toFixed(2),
            rawAmount: xshCUSDBalance,
            usdValue: xshCUSDUsdValue,
          },
          xshCBTC: {
            amount: parseFloat(xshCBTCAmount).toFixed(8), // 8 decimals for BTC
            rawAmount: xshCBTCBalance,
            usdValue: xshCBTCUsdValue,
          },
          totalUsdValue,
        };

        setBalances(fetchedBalances);
      } catch (err) {
        console.error("[useReceiptTokenBalances] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch receipt token balances");

        // Set zero balances on error
        setBalances({
          xshCUSD: { amount: "0.00", rawAmount: 0n, usdValue: "0.00" },
          xshCBTC: { amount: "0.00000000", rawAmount: 0n, usdValue: "0.00" },
          totalUsdValue: "0.00",
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
