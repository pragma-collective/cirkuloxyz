import type { Route } from "./+types/wallet.on-ramp";
import { useNavigate } from "react-router";
import { useState } from "react";
import { AuthenticatedLayout } from "~/components/layouts/authenticated-layout";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Coins, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useAuth } from "~/context/auth-context";
import { useLensSession } from "~/context/lens-context";
import { fundWallet } from "~/lib/api-client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "On-ramp - Wallet - Xersha" },
    {
      name: "description",
      content: "Fund your wallet with CBTC testnet tokens",
    },
  ];
}

type FundingState = "idle" | "loading" | "success" | "error";

export default function WalletOnRampPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessionClient } = useLensSession();
  
  const [fundingState, setFundingState] = useState<FundingState>("idle");
  const [cbtcTxHash, setCbtcTxHash] = useState<string>("");
  const [cusdTxHash, setCusdTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const walletAddress = user?.walletAddress;
  const isConnected = !!walletAddress;

  const handleFundAccount = async () => {
    if (!walletAddress || !sessionClient) {
      setErrorMessage("Please connect your wallet first");
      setFundingState("error");
      return;
    }

    setFundingState("loading");
    setErrorMessage("");
    setCbtcTxHash("");
    setCusdTxHash("");

    try {
      const result = await fundWallet(sessionClient);

      setCbtcTxHash(result.cbtcTransactionHash);
      setCusdTxHash(result.cusdTransactionHash);
      setFundingState("success");
    } catch (error) {
      console.error("Failed to fund wallet:", error);
      
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to fund your wallet. Please try again.");
      }
      
      setFundingState("error");
    }
  };

  const getBlockExplorerUrl = (hash: string) => {
    // Citrea testnet block explorer
    return `https://explorer.testnet.citrea.xyz/tx/${hash}`;
  };

  return (
    <AuthenticatedLayout
      notificationCount={3}
      onNotificationClick={() => console.log("Notifications clicked")}
      onProfileClick={() => navigate("/profile")}
      onNewContribution={() => console.log("New contribution clicked")}
    >
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/wallet")}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Go back to wallet"
            >
              <ArrowLeft className="size-5 text-stone-600" />
            </button>
            <h1 className="text-lg font-semibold text-stone-900">On-ramp</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Coins className="size-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              Fund Your Wallet
            </h2>
            <p className="text-stone-600 max-w-md mx-auto">
              Get testnet CBTC and CUSD to start using Xersha. Free for testing purposes.
            </p>
          </div>

          {/* Wallet Address Display */}
          {isConnected && (
            <div className="mb-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Your Wallet Address
              </label>
              <div className="font-mono text-sm text-stone-900 break-all">
                {walletAddress}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {fundingState === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">
                    Success! Your wallet has been funded
                  </h3>
                  <p className="text-sm text-green-700 mb-3">
                    You've received 0.0001 CBTC and 50 CUSD. The transactions should appear in your wallet shortly.
                  </p>
                  {cbtcTxHash && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-green-800">CBTC Transaction:</span>
                      <br />
                      <a
                        href={getBlockExplorerUrl(cbtcTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 underline break-all"
                      >
                        {cbtcTxHash.slice(0, 10)}...{cbtcTxHash.slice(-8)}
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </div>
                  )}
                  {cusdTxHash && (
                    <div>
                      <span className="text-sm font-medium text-green-800">CUSD Transaction:</span>
                      <br />
                      <a
                        href={getBlockExplorerUrl(cusdTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 underline break-all"
                      >
                        {cusdTxHash.slice(0, 10)}...{cusdTxHash.slice(-8)}
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {fundingState === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">
                    Funding Failed
                  </h3>
                  <p className="text-sm text-red-700">
                    {errorMessage || "An unexpected error occurred. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-4">
            <Button
              onClick={handleFundAccount}
              disabled={!isConnected || fundingState === "loading"}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {fundingState === "loading" ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : (
                "Fund My Account"
              )}
            </Button>

            {!isConnected && (
              <p className="text-sm text-center text-stone-500">
                Please connect your wallet to continue
              </p>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              About Testnet Tokens
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll receive 0.0001 CBTC + 50 CUSD per request</li>
              <li>• Testnet tokens have no real value</li>
              <li>• Use them to test Xersha features</li>
              <li>• Transactions happen on Citrea testnet</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={() => navigate("/wallet")}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Back to Wallet
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
