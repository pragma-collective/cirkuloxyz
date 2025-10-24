import { useState, useEffect, useMemo } from "react";
import type { Route } from "./+types/circle.$id.contribute";
import { useNavigate, useParams } from "react-router";
import { Button } from "app/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "app/lib/utils";
import { useFetchCircle } from "~/hooks/use-fetch-circle";
import { useContribute } from "~/hooks/use-contribute";
import { fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { lensClient } from "app/lib/lens";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { parseEther, formatEther, type Address } from "viem";
import { getMockCUSDAddress } from "app/lib/abi";
import { roscaPoolAbi } from "app/lib/pool-abis";
import { citreaTestnet } from "app/lib/wagmi";

// Client-side loader to fetch group data
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const groupAddress = params.id;

  if (!groupAddress || !groupAddress.startsWith("0x") || groupAddress.length !== 42) {
    return { group: null, error: "Invalid address" };
  }

  try {
    const result = await fetchGroup(lensClient, {
      group: evmAddress(groupAddress),
    });

    if (result.isErr()) {
      return { group: null, error: result.error.message };
    }

    return { group: result.value, error: null };
  } catch (error) {
    console.error("[ClientLoader] Error fetching group:", error);
    return { group: null, error: "Failed to fetch group" };
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  const groupName = loaderData?.group?.metadata?.name;
  return [{ title: groupName ? `Contribute to ${groupName} - Xersha` : "Contribute - Xersha" }];
}

export default function ContributePage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const params = useParams();
  const circleId = params.id;
  const { address: userAddress } = useAccount();

  // Fetch data
  const group = loaderData?.group;
  const { data: circleData, isLoading: isLoadingCircle } = useFetchCircle(circleId);
  const circle = circleData?.data;

  // Contribution hook
  const { contribute, approve, isContributing, isApproving, isConfirming, isApprovalConfirmed, error, isSuccess, approvalTxHash, contributeTxHash } = useContribute();

  // Form state
  const [amount, setAmount] = useState("");
  const [needsApproval, setNeedsApproval] = useState(false);

  // Get user's balance
  const currency = circle?.currency || "cusd";
  const isNativeToken = currency === "cbtc";

  // Native token balance (cBTC)
  const { data: nativeBalance } = useBalance({
    address: userAddress,
    chainId: citreaTestnet.id,
  });

  // ERC20 token balance (CUSD)
  const { data: erc20Balance } = useBalance({
    address: userAddress,
    token: !isNativeToken ? (getMockCUSDAddress() as Address) : undefined,
    chainId: citreaTestnet.id,
  });

  const userBalance = isNativeToken ? nativeBalance : erc20Balance;

  // For ROSCA: Read the fixed contribution amount from contract
  const { data: fixedContributionAmount } = useReadContract({
    address: circle?.poolAddress as Address,
    abi: roscaPoolAbi,
    functionName: "contributionAmount",
    query: {
      enabled: !!circle && circle.circleType === "rotating",
    },
  });

  // Auto-redirect on success after 2 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate(`/circle/${circleId}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate, circleId]);

  // For ROSCA: Set fixed amount automatically
  useEffect(() => {
    if (circle?.circleType === "rotating" && fixedContributionAmount) {
      setAmount(formatEther(fixedContributionAmount as bigint));
    }
  }, [circle?.circleType, fixedContributionAmount]);

  // Check if approval is needed (for CUSD only)
  useEffect(() => {
    if (!isNativeToken && circle && amount && userAddress && !isApprovalConfirmed) {
      // For simplicity, assume approval is always needed initially
      // After approval confirms, needsApproval will be set to false
      setNeedsApproval(true);
    } else {
      setNeedsApproval(false);
    }
  }, [isNativeToken, circle, amount, userAddress, isApprovalConfirmed]);

  // Auto-proceed: After approval confirms, automatically trigger contribute
  useEffect(() => {
    if (isApprovalConfirmed && !isContributing && !isSuccess && circle) {
      console.log("[Contribute] Approval confirmed, auto-proceeding to contribute");

      // Brief delay to show "Approved!" status (500ms)
      setTimeout(async () => {
        await contribute({
          poolAddress: circle.poolAddress as Address,
          circleType: circle.circleType,
          currency: circle.currency,
          amount: circle.circleType !== "rotating" ? amount : undefined,
          fixedAmount: circle.circleType === "rotating" ? (fixedContributionAmount as bigint) : undefined,
        });
      }, 500);
    }
  }, [isApprovalConfirmed, isContributing, isSuccess, circle, amount, fixedContributionAmount, contribute]);

  // Handle contribute/approve button click
  const handleSubmit = async () => {
    if (!circle || !userAddress) return;

    // Step 1: Approve if needed (CUSD only)
    if (needsApproval && !isNativeToken) {
      const amountInWei = parseEther(amount);
      const result = await approve(circle.poolAddress as Address, amountInWei);

      if (!result.success) {
        return; // Error handled by hook
      }

      // After approval, set needsApproval to false
      setNeedsApproval(false);
      return; // User needs to click again to contribute
    }

    // Step 2: Contribute
    const result = await contribute({
      poolAddress: circle.poolAddress as Address,
      circleType: circle.circleType,
      currency: circle.currency,
      amount: circle.circleType !== "rotating" ? amount : undefined,
      fixedAmount: circle.circleType === "rotating" ? (fixedContributionAmount as bigint) : undefined,
    });

    if (!result.success) {
      // Error handled by hook
      return;
    }
  };

  // Loading state
  if (isLoadingCircle || !group || !circle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <Loader2 className="size-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  const circleName = circle.circleName || "Circle";
  const circleTypeLabel =
    circle.circleType === "contribution"
      ? "Contribution"
      : circle.circleType === "rotating"
        ? "Rotating"
        : "Fundraising";

  const currencySymbol = currency === "cbtc" ? "cBTC" : "USD";
  const isROSCA = circle.circleType === "rotating";

  // Button text and state
  const getButtonText = () => {
    if (isApproving && !isConfirming) return "Approving...";
    if (isApproving && isConfirming) return "Confirming approval...";
    if (isApprovalConfirmed && !isContributing) return "Approved! Contributing...";
    if (isContributing && !isConfirming) return "Contributing...";
    if (isContributing && isConfirming) return "Confirming contribution...";
    if (isSuccess) return "Success!";
    if (needsApproval) return `Approve ${currencySymbol}`;
    if (!amount || parseFloat(amount) <= 0) return "Enter amount";
    return `Contribute ${amount} ${currencySymbol}`;
  };

  // Button color based on state - matching circle-hero styling
  const getButtonClassName = () => {
    // Success state
    if (isSuccess) return "bg-success-600 hover:bg-success-600";

    // All circle types use the same primary-secondary gradient
    return "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600";
  };

  const isButtonDisabled =
    isApproving ||
    isContributing ||
    isConfirming ||
    isSuccess ||
    !amount ||
    parseFloat(amount) <= 0 ||
    !userAddress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Bar - Back button + Circle Info */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/circle/${circleId}`)}
            className="text-neutral-700 hover:text-neutral-900 -ml-2"
          >
            <ArrowLeft className="size-5 mr-2" />
            Back to Circle
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-900">{circleName}</span>
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                circle.circleType === "contribution" && "bg-primary-100 text-primary-700",
                circle.circleType === "rotating" && "bg-secondary-100 text-secondary-700",
                circle.circleType === "fundraising" && "bg-success-100 text-success-700"
              )}
            >
              {circleTypeLabel}
            </span>
          </div>
        </div>

        {/* Center - JUST THE AMOUNT (Cash App style) */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
          {/* Pure amount display - no currency symbol */}
          <input
            type="number"
            value={amount}
            onChange={(e) => !isROSCA && setAmount(e.target.value)}
            readOnly={isROSCA}
            disabled={isROSCA || isContributing || isApproving || isSuccess}
            placeholder={currency === "cbtc" ? "0.000000" : "0.00"}
            step="any"
            className={cn(
              "text-center text-8xl sm:text-9xl font-bold bg-transparent border-none p-0 text-neutral-900 placeholder:text-neutral-400/40 transition-all outline-none min-w-[300px]",
              isROSCA && "cursor-not-allowed opacity-75",
              (isContributing || isApproving || isSuccess) && "opacity-60"
            )}
            style={{ width: `${Math.max(amount.length || 1, 5)}ch` }}
          />

          {/* Approval Status Indicator */}
          {isApprovalConfirmed && !isSuccess && (
            <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-success-50 border border-success-200 rounded-full">
              <CheckCircle2 className="size-5 text-success-600" />
              <span className="text-sm font-medium text-success-700">Approved!</span>
            </div>
          )}

          {isROSCA && (
            <p className="text-sm text-neutral-600/80 mt-4 max-w-xs text-center">
              Fixed amount per 30-day round
            </p>
          )}
        </div>

        {/* Bottom - Balance, Messages, Button */}
        <div className="p-6 space-y-4 max-w-md mx-auto w-full">
          {/* Balance */}
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
            <span>Balance:</span>
            <span className="font-semibold text-neutral-900">
              {userBalance ? `${parseFloat(formatEther(userBalance.value)).toFixed(currency === "cbtc" ? 6 : 2)} ${currencySymbol}` : "-"}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-error-50 border border-error-200 rounded-xl">
              <AlertCircle className="size-5 text-error-600 shrink-0" />
              <p className="text-sm text-error-700">{error.message}</p>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="flex items-center gap-2 p-4 bg-success-50 border border-success-200 rounded-xl">
              <CheckCircle2 className="size-5 text-success-600 shrink-0" />
              <p className="text-sm text-success-700">
                Contribution successful! Redirecting...
              </p>
            </div>
          )}

          {/* Pre-select Amount Pills - Only for non-ROSCA circles */}
          {!isROSCA && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {(currency === "cbtc"
                ? [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05]
                : [10, 25, 50, 100, 250, 500]
              ).map((presetAmount) => {
                const amountStr = presetAmount.toString();
                const isSelected = amount === amountStr;

                return (
                  <button
                    key={presetAmount}
                    type="button"
                    onClick={() => setAmount(amountStr)}
                    disabled={isContributing || isApproving || isSuccess}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                      "border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
                      isSelected
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white text-neutral-700 border-neutral-300 hover:border-primary-300 hover:bg-primary-50",
                      (isContributing || isApproving || isSuccess) && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {currency === "cbtc" ? `${presetAmount} cBTC` : `$${presetAmount}`}
                  </button>
                );
              })}
            </div>
          )}

          {/* Submit Button */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              size="lg"
              className={cn(
                "w-full text-base font-semibold transition-all duration-300",
                getButtonClassName(),
                isConfirming && "cursor-wait"
              )}
            >
              {(isApproving || isContributing || isConfirming) && (
                <Loader2 className="size-5 animate-spin mr-2" />
              )}
              {isApprovalConfirmed && !isContributing && (
                <CheckCircle2 className="size-5 mr-2" />
              )}
              {isSuccess && <CheckCircle2 className="size-5 mr-2" />}
              {getButtonText()}
            </Button>

            {needsApproval && !isApproving && !isConfirming && (
              <p className="text-xs text-center text-neutral-600">
                You need to approve {currencySymbol} before contributing. This is a one-time approval.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
