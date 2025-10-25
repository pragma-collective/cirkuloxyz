import { Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { useEnsName } from "~/hooks/use-ens-name";
import { formatAddress } from "~/lib/format-address";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export interface WalletAddressDisplayProps {
  address: string | null;
  isConnected: boolean;
  onConnect?: () => void;
  className?: string;
}

export function WalletAddressDisplay({
  address,
  isConnected,
  onConnect,
  className,
}: WalletAddressDisplayProps) {
  const { copyToClipboard, copied } = useCopyToClipboard();
  const { ensName, isLoading: isLoadingEns } = useEnsName(address);

  // Disconnected state
  if (!isConnected || !address) {
    return (
      <div
        className={cn(
          "px-4 py-5 bg-stone-50 border-b border-stone-200",
          className
        )}
      >
        <p className="text-sm text-stone-600 mb-3">Wallet Not Connected</p>
        <Button
          onClick={onConnect}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-4 py-5 bg-stone-50 border-b border-stone-200",
        className
      )}
    >
      <p className="text-sm text-stone-600 mb-1">Connected Wallet</p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* ENS Name (if available) */}
          {isLoadingEns ? (
            <div className="h-6 w-32 bg-stone-200 rounded animate-pulse mb-1" />
          ) : ensName ? (
            <p className="text-lg font-semibold text-stone-900 truncate">
              {ensName}
            </p>
          ) : null}

          {/* Truncated Address */}
          <p
            className={cn(
              "text-sm font-mono text-stone-500",
              ensName && "text-xs" // Smaller if ENS name is shown
            )}
          >
            {formatAddress(address)}
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={() => copyToClipboard(address)}
          className={cn(
            "p-2.5 rounded-lg transition-all",
            "hover:bg-stone-200 active:bg-stone-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
            copied && "bg-green-50 hover:bg-green-100"
          )}
          aria-label="Copy wallet address"
        >
          {copied ? (
            <Check className="size-5 text-green-600" />
          ) : (
            <Copy className="size-5 text-stone-500" />
          )}
        </button>
      </div>

      {/* Copied Feedback */}
      {copied && (
        <p className="text-xs text-green-600 mt-2 font-medium">
          ✓ Address copied to clipboard
        </p>
      )}
    </div>
  );
}
