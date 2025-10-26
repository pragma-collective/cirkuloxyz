import { useState } from "react";
import type { Route } from "./+types/wallet.send";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, QrCode, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TransactionSummary } from "~/components/wallet/transaction-summary";
import { TransactionStatusModal } from "~/components/wallet/transaction-status-modal";
import { sendTransactionSchema, type SendTransactionFormData } from "~/schemas/send-transaction-schema";
import { useEnsResolver } from "~/hooks/use-ens-resolver";
import { useSendTransaction } from "~/hooks/use-send-transaction";
import { useTokenPrice } from "~/hooks/use-token-price";
import { useWalletBalances } from "~/hooks/use-wallet-balances";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Send - Xersha" },
    {
      name: "description",
      content: "Send CBTC or CUSD to friends and family",
    },
  ];
}

export default function SendPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<"entry" | "review">("entry");
  const [selectedToken, setSelectedToken] = useState<"CBTC" | "CUSD">("CBTC");

  // Form management
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SendTransactionFormData>({
    resolver: zodResolver(sendTransactionSchema),
    defaultValues: {
      token: "CBTC",
      recipient: "",
      amount: "",
    },
  });

  // Watch form values
  const recipientValue = watch("recipient");
  const amountValue = watch("amount");

  // Hooks
  const { balances, isLoading: isLoadingBalances } = useWalletBalances();
  const { ensName } = useEnsResolver(recipientValue);
  const { sendTransaction, status, txHash, error, reset } = useSendTransaction();
  const { formatUSD } = useTokenPrice(selectedToken);

  // Get current balance for selected token
  const currentBalance = selectedToken === "CBTC"
    ? parseFloat(balances?.cbtc.amount || "0")
    : parseFloat(balances?.cusd.amount || "0");

  // Handle token selection
  const handleTokenSelect = (token: "CBTC" | "CUSD") => {
    setSelectedToken(token);
    setValue("token", token);
    // Reset amount when changing tokens to avoid confusion
    setValue("amount", "");
  };

  // Form submission - move to review
  const handleReview = handleSubmit((data) => {
    // Additional validation: check if amount exceeds balance
    const amount = parseFloat(data.amount);

    if (amount > currentBalance) {
      setError("amount", {
        type: "manual",
        message: "Insufficient balance",
      });
      return;
    }

    setFormState("review");
  });

  // Confirm transaction
  const handleConfirm = handleSubmit(async (data) => {
    await sendTransaction(data);
  });

  // Handle retry on error
  const handleRetry = () => {
    reset();
    setFormState("review"); // Stay on review screen
  };

  // Handle close modal
  const handleCloseModal = () => {
    reset();
    if (status === "success") {
      // On success, navigate back to wallet
      navigate("/wallet");
    }
    // On error/cancel, stay on page
  };

  // Handle QR scanner (placeholder)
  const handleQRScan = () => {
    console.log("QR scanner TODO: Open camera and scan QR code");
    // TODO: Implement QR code scanning functionality
  };

  // Button disabled state
  const isButtonDisabled =
    !recipientValue ||
    !amountValue ||
    !!errors.recipient ||
    !!errors.amount ||
    parseFloat(amountValue) <= 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden animate-in fade-in duration-300">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex min-h-screen flex-col animate-in slide-in-from-bottom duration-400 delay-100">
          {/* TOP: Back button + Token selector */}
          <div className="flex items-center justify-between p-4 sm:p-6 relative z-20">
            {/* Left: Back button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/wallet")}
              className="text-neutral-700 hover:text-neutral-900 -ml-2"
            >
              <ArrowLeft className="size-5 mr-2" />
              Back to Wallet
            </Button>

            {/* Right: Compact token selector pills */}
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Select token">
              <button
                type="button"
                role="radio"
                aria-checked={selectedToken === "CBTC"}
                onClick={() => handleTokenSelect("CBTC")}
                disabled={formState === "review"}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 min-h-[44px] min-w-[80px]",
                  selectedToken === "CBTC"
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white/80 backdrop-blur text-neutral-700 border-neutral-300 hover:border-primary-400",
                  formState === "review" && "opacity-60 cursor-not-allowed"
                )}
              >
                CBTC
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedToken === "CUSD"}
                onClick={() => handleTokenSelect("CUSD")}
                disabled={formState === "review"}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 min-h-[44px] min-w-[80px]",
                  selectedToken === "CUSD"
                    ? "bg-secondary-600 text-white border-secondary-600"
                    : "bg-white/80 backdrop-blur text-neutral-700 border-neutral-300 hover:border-secondary-400",
                  formState === "review" && "opacity-60 cursor-not-allowed"
                )}
              >
                CUSD
              </button>
            </div>
          </div>

          {/* CENTER: Recipient + Amount (Form State) */}
          {formState === "entry" && (
            <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20 space-y-8">
              {/* Recipient Input */}
              <div className="w-full max-w-md space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={recipientValue}
                    onChange={(e) => setValue("recipient", e.target.value)}
                    placeholder="0x... or username.eth"
                    className={cn(
                      "w-full px-6 py-4 pr-14 rounded-2xl border-2 transition-all",
                      "text-center text-base font-medium bg-white/60 backdrop-blur-sm",
                      "placeholder:text-neutral-400",
                      errors.recipient
                        ? "border-error-500 focus:border-error-500 focus:ring-error-500/10"
                        : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/10",
                      "focus:outline-none focus:ring-4"
                    )}
                    aria-label="Recipient address or ENS name"
                    aria-invalid={!!errors.recipient}
                  />
                  {/* QR Scanner button */}
                  <button
                    type="button"
                    onClick={handleQRScan}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Scan QR code"
                  >
                    <QrCode className="size-5 text-neutral-700" />
                  </button>
                </div>
                {/* Validation feedback */}
                {errors.recipient && (
                  <p className="text-sm text-error-600 text-center flex items-center justify-center gap-1">
                    <AlertCircle className="size-4" />
                    {errors.recipient.message}
                  </p>
                )}
                {ensName && !errors.recipient && (
                  <p className="text-sm text-success-700 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="size-4" />
                    Resolved to {ensName}
                  </p>
                )}
              </div>

              {/* Amount Input - HUGE Cash App style */}
              <div className="w-full flex flex-col items-center">
                <input
                  type="number"
                  value={amountValue}
                  onChange={(e) => setValue("amount", e.target.value)}
                  placeholder={selectedToken === "CBTC" ? "0.000000" : "0.00"}
                  step="any"
                  className={cn(
                    "text-center text-7xl sm:text-8xl md:text-9xl font-bold",
                    "bg-transparent border-none p-0 outline-none",
                    "text-neutral-900 placeholder:text-neutral-400/40",
                    "transition-all w-auto min-w-[300px]"
                  )}
                  style={{ width: `${Math.max((amountValue?.length || 1), 5)}ch` }}
                  aria-label="Amount to send"
                  aria-invalid={!!errors.amount}
                />
                {/* Currency label */}
                <p className="text-2xl font-semibold text-neutral-600 mt-2">
                  {selectedToken}
                </p>
              </div>
            </div>
          )}

          {/* CENTER: Review State */}
          {formState === "review" && (
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
              <div className="w-full max-w-lg">
                <TransactionSummary
                  token={selectedToken}
                  amount={amountValue}
                  recipient={recipientValue}
                  ensName={ensName}
                />
              </div>
            </div>
          )}

          {/* BOTTOM: Balance + Fee + Pills + Button */}
          <div className="p-6 space-y-4 max-w-md mx-auto w-full">
            {formState === "entry" && (
              <>
                {/* Balance Display */}
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
                  <span>Balance:</span>
                  {isLoadingBalances ? (
                    <span className="font-semibold text-neutral-400">Loading...</span>
                  ) : (
                    <>
                      <span className="font-semibold text-neutral-900">
                        {currentBalance.toFixed(selectedToken === "CBTC" ? 8 : 2)} {selectedToken}
                      </span>
                      <span className="text-neutral-500">({formatUSD(currentBalance)})</span>
                    </>
                  )}
                </div>

                {/* Error Message */}
                {errors.amount && (
                  <div className="flex items-center gap-2 p-4 bg-error-50 border border-error-200 rounded-xl">
                    <AlertCircle className="size-5 text-error-600 shrink-0" />
                    <p className="text-sm text-error-700">{errors.amount.message}</p>
                  </div>
                )}

                {/* Preset Amount Pills */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {(selectedToken === "CBTC" ? [0.0001, 0.0005, 0.001, 0.005] : [10, 25, 50, 100, 250]).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setValue("amount", preset.toString())}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border-2 min-h-[44px]",
                        amountValue === preset.toString()
                          ? "bg-primary-600 text-white border-primary-600"
                          : "bg-white text-neutral-700 border-neutral-300 hover:border-primary-400"
                      )}
                    >
                      {selectedToken === "CBTC" ? `${preset}` : `$${preset}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Submit Button (both states) */}
            <Button
              onClick={formState === "entry" ? handleReview : handleConfirm}
              disabled={formState === "entry" && isButtonDisabled}
              size="lg"
              className={cn(
                "w-full text-base font-semibold transition-all min-h-[56px]",
                "bg-gradient-to-r from-primary-500 to-secondary-500",
                "hover:from-primary-600 hover:to-secondary-600"
              )}
            >
              {status === "processing" && <Loader2 className="size-5 animate-spin mr-2" />}
              {formState === "entry" ? "Review Transaction" : "Confirm & Send"}
            </Button>

            {/* Back to Edit (Review State) */}
            {formState === "review" && (
              <button
                type="button"
                onClick={() => setFormState("entry")}
                className="w-full text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors min-h-[44px]"
              >
                Edit Transaction
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Status Modal */}
      {status !== "idle" && (
        <TransactionStatusModal
          status={status}
          txHash={txHash}
          error={error}
          onClose={handleCloseModal}
          onRetry={status === "error" ? handleRetry : undefined}
        />
      )}
    </>
  );
}
