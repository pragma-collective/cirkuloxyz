import { useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";

interface TransactionStatusModalProps {
  status: "processing" | "success" | "error";
  txHash?: string | null;
  error?: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

export function TransactionStatusModal({
  status,
  txHash,
  error,
  onClose,
  onRetry,
}: TransactionStatusModalProps) {
  const { copyToClipboard, copied } = useCopyToClipboard();

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "processing") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [status, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && status !== "processing") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Processing State */}
        {status === "processing" && (
          <>
            <div className="flex flex-col items-center gap-4">
              <Loader2
                className="w-16 h-16 text-[oklch(0.75_0.15_45)] animate-spin"
                aria-hidden="true"
              />
              <div className="text-center">
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-neutral-900"
                >
                  Sending Transaction
                </h2>
                <p className="text-neutral-600 mt-2">
                  Please wait while your transaction is being processed...
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-900">
                <strong>Do not close this window</strong> or navigate away until
                the transaction is complete.
              </p>
            </div>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[oklch(0.95_0.05_160)] flex items-center justify-center">
                <CheckCircle2
                  className="w-10 h-10 text-[oklch(0.70_0.15_160)]"
                  aria-hidden="true"
                />
              </div>
              <div className="text-center">
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-neutral-900"
                >
                  Transaction Sent!
                </h2>
                <p className="text-neutral-600 mt-2">
                  Your transaction has been successfully submitted to the network.
                </p>
              </div>
            </div>

            {txHash && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-700">
                  Transaction Hash
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-neutral-100 rounded-lg text-xs font-mono text-neutral-900 overflow-hidden text-ellipsis">
                    {txHash}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(txHash)}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors min-w-[40px] min-h-[40px]"
                    aria-label={copied ? "Copied!" : "Copy transaction hash"}
                  >
                    <Copy
                      className="w-5 h-5 text-neutral-600"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-[oklch(0.70_0.15_160)]" role="status">
                    Copied to clipboard!
                  </p>
                )}

                <a
                  href={`https://explorer.testnet.citrea.xyz/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors text-neutral-900 font-medium"
                >
                  <span>View on Explorer</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3 bg-[oklch(0.75_0.15_45)] text-white font-semibold rounded-xl hover:bg-[oklch(0.70_0.15_45)] transition-colors min-h-[48px]"
            >
              Done
            </button>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle
                  className="w-10 h-10 text-[oklch(0.65_0.20_25)]"
                  aria-hidden="true"
                />
              </div>
              <div className="text-center">
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-neutral-900"
                >
                  Transaction Failed
                </h2>
                <p className="text-neutral-600 mt-2">
                  Your transaction could not be completed.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-900">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="w-full px-6 py-3 bg-[oklch(0.75_0.15_45)] text-white font-semibold rounded-xl hover:bg-[oklch(0.70_0.15_45)] transition-colors min-h-[48px]"
                >
                  Try Again
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full px-6 py-3 border-2 border-neutral-200 text-neutral-900 font-semibold rounded-xl hover:border-neutral-300 transition-colors min-h-[48px]"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
