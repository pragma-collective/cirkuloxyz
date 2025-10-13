import { cn } from "app/lib/utils";

interface XershaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function XershaLogo({ className, size = "md" }: XershaLogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Icon - Momentum Wave */}
      <svg
        className={cn(sizeClasses[size], "w-auto")}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base wave - Small (Orange) */}
        <path
          d="M4 32 Q10 28 16 32 T28 32 T40 32 T44 32"
          stroke="url(#logo-wave-gradient-1)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Middle wave - Medium (Orange-Purple blend) */}
        <path
          d="M4 24 Q10 18 16 24 T28 24 T40 24 T44 24"
          stroke="url(#logo-wave-gradient-2)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top wave - Large (Purple) */}
        <path
          d="M4 14 Q10 6 16 14 T28 14 T40 14 T44 14"
          stroke="url(#logo-wave-gradient-3)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Accent dots showing momentum */}
        <circle cx="16" cy="14" r="2" fill="oklch(0.70 0.14 290)" opacity="0.8" />
        <circle cx="28" cy="14" r="2.5" fill="oklch(0.60 0.17 290)" />
        <circle cx="40" cy="14" r="3" fill="oklch(0.52 0.16 290)" />

        <defs>
          <linearGradient
            id="logo-wave-gradient-1"
            x1="4"
            y1="32"
            x2="44"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="oklch(0.75 0.14 45)" />
            <stop offset="0.5" stopColor="oklch(0.65 0.17 45)" />
            <stop offset="1" stopColor="oklch(0.70 0.15 90)" />
          </linearGradient>

          <linearGradient
            id="logo-wave-gradient-2"
            x1="4"
            y1="24"
            x2="44"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="oklch(0.72 0.15 60)" />
            <stop offset="0.5" stopColor="oklch(0.68 0.16 167)" />
            <stop offset="1" stopColor="oklch(0.65 0.16 240)" />
          </linearGradient>

          <linearGradient
            id="logo-wave-gradient-3"
            x1="4"
            y1="14"
            x2="44"
            y2="14"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="oklch(0.68 0.15 200)" />
            <stop offset="0.5" stopColor="oklch(0.60 0.17 290)" />
            <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Brand Name */}
      <div className="flex flex-col">
        <span className="font-bold text-2xl text-neutral-900 leading-none tracking-tight">
          Xersha
        </span>
        <span className="text-xs text-neutral-600 leading-none mt-0.5">
          Save Together
        </span>
      </div>
    </div>
  );
}
