import { useState, useEffect } from "react";
import { estimateGas, getGasPrice } from "wagmi/actions";
import { parseEther, formatEther, type Address } from "viem";
import { wagmiConfig, citreaTestnet } from "~/lib/wagmi";
import { erc20Abi, getMockCUSDAddress } from "~/lib/abi";
import { useAccount } from "wagmi";

/**
 * Hook for estimating network fees on Citrea testnet
 * Provides realistic gas estimates for both CBTC and CUSD transfers
 */
export function useFeeEstimator(token: "CBTC" | "CUSD") {
  const { address: userAddress } = useAccount();
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function estimateFee() {
      if (!userAddress) {
        // Use fallback mock fees if no wallet connected
        setEstimatedFee(token === "CBTC" ? 0.0002 : 16.0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Dummy recipient for gas estimation (zero address)
        const dummyRecipient: Address = "0x0000000000000000000000000000000000000000";
        const dummyAmount = parseEther("0.01"); // Small amount for estimation

        // Get current gas price
        const gasPrice = await getGasPrice(wagmiConfig, {
          chainId: citreaTestnet.id,
        });

        let gasEstimate: bigint;

        if (token === "CBTC") {
          // Estimate gas for native CBTC transfer
          gasEstimate = await estimateGas(wagmiConfig, {
            account: userAddress,
            to: dummyRecipient,
            value: dummyAmount,
            chainId: citreaTestnet.id,
          });
        } else {
          // Estimate gas for CUSD ERC20 transfer
          const cusdAddress = getMockCUSDAddress();

          gasEstimate = await estimateGas(wagmiConfig, {
            account: userAddress,
            to: cusdAddress,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [dummyRecipient, dummyAmount],
            }),
            chainId: citreaTestnet.id,
          });
        }

        // Calculate total fee in Wei
        const feeInWei = gasEstimate * gasPrice;

        // Convert to token units
        if (token === "CBTC") {
          // Fee in CBTC (convert from Wei)
          const feeInCBTC = parseFloat(formatEther(feeInWei));
          setEstimatedFee(feeInCBTC);
        } else {
          // For CUSD, we need to express the gas cost in CUSD value
          // Gas is paid in cBTC, so we need to convert cBTC value to USD
          const feeInCBTC = parseFloat(formatEther(feeInWei));

          // BTC price (hardcoded for now, could be fetched from oracle)
          const btcPriceUSD = 111652.80;
          const feeInUSD = feeInCBTC * btcPriceUSD;

          setEstimatedFee(feeInUSD);
        }

        console.log("[useFeeEstimator]", {
          token,
          gasEstimate: gasEstimate.toString(),
          gasPrice: gasPrice.toString(),
          estimatedFee: token === "CBTC"
            ? `${parseFloat(formatEther(feeInWei)).toFixed(8)} CBTC`
            : `$${(parseFloat(formatEther(feeInWei)) * 111652.80).toFixed(2)}`,
        });

      } catch (error) {
        console.error("[useFeeEstimator] Error estimating gas:", error);

        // Fallback to reasonable mock fees on error
        setEstimatedFee(token === "CBTC" ? 0.0002 : 16.0);
      } finally {
        setIsLoading(false);
      }
    }

    estimateFee();
  }, [token, userAddress]);

  return {
    estimatedFee,
    isLoading,
  };
}

// Helper function to encode function data
function encodeFunctionData({
  abi,
  functionName,
  args,
}: {
  abi: typeof erc20Abi;
  functionName: string;
  args: unknown[];
}): `0x${string}` {
  // Find the function in the ABI
  const func = abi.find((item) => item.type === "function" && item.name === functionName);
  if (!func || func.type !== "function") {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  // For transfer function: function selector (4 bytes) + encoded parameters
  // This is a simplified implementation - in production, use viem's encodeFunctionData
  const selector = "0xa9059cbb"; // transfer(address,uint256) selector

  // Encode address (32 bytes, left-padded)
  const addressParam = (args[0] as string).slice(2).padStart(64, "0");

  // Encode amount (32 bytes, left-padded)
  const amountParam = (args[1] as bigint).toString(16).padStart(64, "0");

  return `${selector}${addressParam}${amountParam}` as `0x${string}`;
}
