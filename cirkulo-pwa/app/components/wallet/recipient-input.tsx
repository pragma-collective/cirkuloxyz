import { QrCode, CheckCircle2, AlertCircle } from "lucide-react";
import { forwardRef } from "react";

interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isValid?: boolean;
}

export const RecipientInput = forwardRef<HTMLInputElement, RecipientInputProps>(
  ({ value, onChange, error, isValid }, ref) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor="recipient"
          className="block text-sm font-medium text-neutral-700"
        >
          Recipient Address
        </label>

        <div className="relative">
          <input
            ref={ref}
            id="recipient"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0x... or username.eth"
            className={`
              w-full px-4 py-3 pr-24 rounded-xl border-2 transition-colors
              text-base
              ${
                error
                  ? "border-[oklch(0.65_0.20_25)] focus:border-[oklch(0.65_0.20_25)] bg-red-50"
                  : isValid
                  ? "border-[oklch(0.70_0.15_160)] focus:border-[oklch(0.70_0.15_160)] bg-teal-50"
                  : "border-neutral-200 focus:border-[oklch(0.75_0.15_45)] bg-white"
              }
              focus:outline-none focus:ring-0
            `}
            aria-invalid={!!error}
            aria-describedby={error ? "recipient-error" : undefined}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Validation Icon */}
            {isValid && !error && (
              <CheckCircle2
                className="w-5 h-5 text-[oklch(0.70_0.15_160)]"
                aria-label="Valid address"
              />
            )}
            {error && (
              <AlertCircle
                className="w-5 h-5 text-[oklch(0.65_0.20_25)]"
                aria-label="Invalid address"
              />
            )}

            {/* QR Scanner Button - TODO: Implement QR scanning */}
            <button
              type="button"
              aria-label="Scan QR code"
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => {
                // TODO: Implement QR code scanning
                console.log("QR scanning not yet implemented");
              }}
            >
              <QrCode className="w-5 h-5 text-neutral-600" aria-hidden="true" />
            </button>
          </div>
        </div>

        {error && (
          <p id="recipient-error" className="text-sm text-[oklch(0.65_0.20_25)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

RecipientInput.displayName = "RecipientInput";
