import type { Route } from "./+types/wallet.receive";
import { useNavigate } from "react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AuthenticatedLayout } from "~/components/layouts/authenticated-layout";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Copy, Check, Wallet2, AlertCircle } from "lucide-react";
import { useAuth } from "~/context/auth-context";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Receive - Wallet - Xersha" },
    {
      name: "description",
      content: "Receive cryptocurrency to your wallet",
    },
  ];
}

export default function WalletReceivePage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [copied, setCopied] = useState(false);
  
  const walletAddress = user?.walletAddress;
  const isConnected = !!walletAddress;

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
            <h1 className="text-lg font-semibold text-stone-900">Receive</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          {isConnected ? (
            <>
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Wallet2 className="size-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  Receive Funds
                </h2>
                <p className="text-stone-600 max-w-md mx-auto">
                  Share your wallet address or QR code to receive cryptocurrency
                </p>
              </div>

              {/* QR Code Section */}
              <div className="mb-8 flex justify-center">
                <div className="bg-white p-6 rounded-2xl border-2 border-stone-200 shadow-sm">
                  <QRCodeSVG
                    value={walletAddress}
                    size={256}
                    level="H"
                    includeMargin
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Wallet Address Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-3 text-center">
                  Your Wallet Address
                </label>
                
                {/* Address Display with Copy Button */}
                <div className="flex items-center gap-2 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex-1 overflow-hidden">
                    <p className="font-mono text-sm text-stone-900 break-all">
                      {walletAddress}
                    </p>
                    <p className="text-xs text-stone-500 mt-1 sm:hidden">
                      Tap to copy
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyAddress}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    aria-label={copied ? "Address copied" : "Copy address"}
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        <span className="ml-1 hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        <span className="ml-1 hidden sm:inline">Copy</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Success Feedback */}
                {copied && (
                  <p className="text-sm text-green-600 text-center mt-2 animate-in fade-in slide-in-from-top-1">
                    ✓ Address copied to clipboard
                  </p>
                )}
              </div>

              {/* Info Section */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="size-4" />
                  Important Information
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Only send CBTC or CUSD on Citrea testnet to this address</li>
                  <li>• Sending assets from other networks will result in loss of funds</li>
                  <li>• Double-check the address before sending</li>
                  <li>• You can scan the QR code with a mobile wallet</li>
                </ul>
              </div>

              {/* Network Badge */}
              <div className="mt-6 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded-full">
                  <span className="size-2 bg-green-500 rounded-full animate-pulse" />
                  Citrea Testnet
                </span>
              </div>
            </>
          ) : (
            /* Not Connected State */
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-full mb-4">
                <Wallet2 className="size-8 text-stone-400" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-3">
                Wallet Not Connected
              </h2>
              <p className="text-stone-600 mb-6 max-w-md mx-auto">
                Please connect your wallet to view your address and QR code
              </p>
              <Button
                onClick={login}
                size="lg"
                className="px-8"
              >
                Connect Wallet
              </Button>
            </div>
          )}

          {/* Back Button */}
          {isConnected && (
            <div className="mt-8 text-center">
              <Button
                onClick={() => navigate("/wallet")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Back to Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
