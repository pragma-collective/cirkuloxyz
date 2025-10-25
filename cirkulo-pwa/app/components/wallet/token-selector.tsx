import { Bitcoin, DollarSign } from "lucide-react";

interface TokenSelectorProps {
  selected: "CBTC" | "CUSD";
  onSelect: (token: "CBTC" | "CUSD") => void;
}

export function TokenSelector({ selected, onSelect }: TokenSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select token to send"
      className="sticky top-16 z-10 bg-white border-b border-neutral-200 px-4 py-3"
    >
      <div className="flex gap-3">
        <button
          type="button"
          role="radio"
          aria-checked={selected === "CBTC"}
          onClick={() => onSelect("CBTC")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
            border-2 font-semibold transition-all duration-200
            min-h-[44px]
            ${
              selected === "CBTC"
                ? "border-[oklch(0.75_0.15_45)] bg-[oklch(0.98_0.02_45)] text-[oklch(0.55_0.15_45)]"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            }
          `}
        >
          <Bitcoin className="w-5 h-5" aria-hidden="true" />
          <span>CBTC</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selected === "CUSD"}
          onClick={() => onSelect("CUSD")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
            border-2 font-semibold transition-all duration-200
            min-h-[44px]
            ${
              selected === "CUSD"
                ? "border-[oklch(0.70_0.18_290)] bg-[oklch(0.98_0.02_290)] text-[oklch(0.50_0.18_290)]"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            }
          `}
        >
          <DollarSign className="w-5 h-5" aria-hidden="true" />
          <span>CUSD</span>
        </button>
      </div>
    </div>
  );
}
