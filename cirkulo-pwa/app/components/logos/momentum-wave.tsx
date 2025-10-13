import { cn } from "app/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function MomentumWaveIcon({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="momentum-title"
    >
      <title id="momentum-title">Xersha Momentum Wave Logo</title>
      <desc>Dynamic upward waves representing collective momentum and exponential growth</desc>

      {/* Base wave - Small (Orange) */}
      <path
        d="M4 32 Q10 28 16 32 T28 32 T40 32 T44 32"
        stroke="url(#wave-gradient-1)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Middle wave - Medium (Orange-Purple blend) */}
      <path
        d="M4 24 Q10 18 16 24 T28 24 T40 24 T44 24"
        stroke="url(#wave-gradient-2)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Top wave - Large (Purple) */}
      <path
        d="M4 14 Q10 6 16 14 T28 14 T40 14 T44 14"
        stroke="url(#wave-gradient-3)"
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
          id="wave-gradient-1"
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
          id="wave-gradient-2"
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
          id="wave-gradient-3"
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
  );
}

export function MomentumWaveHorizontal({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="momentum-h-title"
    >
      <title id="momentum-h-title">Xersha Logo</title>

      {/* Logo mark */}
      <g>
        <path
          d="M4 32 Q10 28 16 32 T28 32 T40 32 T44 32"
          stroke="url(#mh-gradient-1)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M4 24 Q10 18 16 24 T28 24 T40 24 T44 24"
          stroke="url(#mh-gradient-2)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M4 14 Q10 6 16 14 T28 14 T40 14 T44 14"
          stroke="url(#mh-gradient-3)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="16" cy="14" r="2" fill="oklch(0.70 0.14 290)" opacity="0.8" />
        <circle cx="28" cy="14" r="2.5" fill="oklch(0.60 0.17 290)" />
        <circle cx="40" cy="14" r="3" fill="oklch(0.52 0.16 290)" />
      </g>

      {/* Wordmark */}
      <text
        x="56"
        y="32"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="oklch(0.25 0.004 45)"
        letterSpacing="-0.5"
      >
        Xersha
      </text>

      <defs>
        <linearGradient id="mh-gradient-1" x1="4" y1="32" x2="44" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.14 45)" />
          <stop offset="0.5" stopColor="oklch(0.65 0.17 45)" />
          <stop offset="1" stopColor="oklch(0.70 0.15 90)" />
        </linearGradient>
        <linearGradient id="mh-gradient-2" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.72 0.15 60)" />
          <stop offset="0.5" stopColor="oklch(0.68 0.16 167)" />
          <stop offset="1" stopColor="oklch(0.65 0.16 240)" />
        </linearGradient>
        <linearGradient id="mh-gradient-3" x1="4" y1="14" x2="44" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.68 0.15 200)" />
          <stop offset="0.5" stopColor="oklch(0.60 0.17 290)" />
          <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MomentumWaveFull({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="momentum-f-title"
    >
      <title id="momentum-f-title">Xersha - Save Together</title>

      {/* Logo mark */}
      <g>
        <path
          d="M4 32 Q10 28 16 32 T28 32 T40 32 T44 32"
          stroke="url(#mf-gradient-1)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M4 24 Q10 18 16 24 T28 24 T40 24 T44 24"
          stroke="url(#mf-gradient-2)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M4 14 Q10 6 16 14 T28 14 T40 14 T44 14"
          stroke="url(#mf-gradient-3)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="16" cy="14" r="2" fill="oklch(0.70 0.14 290)" opacity="0.8" />
        <circle cx="28" cy="14" r="2.5" fill="oklch(0.60 0.17 290)" />
        <circle cx="40" cy="14" r="3" fill="oklch(0.52 0.16 290)" />
      </g>

      {/* Wordmark */}
      <text
        x="56"
        y="28"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="oklch(0.25 0.004 45)"
        letterSpacing="-0.5"
      >
        Xersha
      </text>

      {/* Tagline */}
      <text
        x="56"
        y="44"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="oklch(0.45 0.006 45)"
      >
        Save Together
      </text>

      <defs>
        <linearGradient id="mf-gradient-1" x1="4" y1="32" x2="44" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.14 45)" />
          <stop offset="0.5" stopColor="oklch(0.65 0.17 45)" />
          <stop offset="1" stopColor="oklch(0.70 0.15 90)" />
        </linearGradient>
        <linearGradient id="mf-gradient-2" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.72 0.15 60)" />
          <stop offset="0.5" stopColor="oklch(0.68 0.16 167)" />
          <stop offset="1" stopColor="oklch(0.65 0.16 240)" />
        </linearGradient>
        <linearGradient id="mf-gradient-3" x1="4" y1="14" x2="44" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.68 0.15 200)" />
          <stop offset="0.5" stopColor="oklch(0.60 0.17 290)" />
          <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const MomentumWaveInfo = {
  name: "Momentum Wave",
  concept: "Dynamic growth and collective momentum",
  description: "Three ascending waves that grow progressively larger and bolder, representing the exponential power of saving together. The flowing curves suggest smooth progress, while the upward trajectory and accent dots convey acceleration and momentum. Each wave layer represents members joining forces, creating unstoppable forward motion.",
  strengths: [
    "Conveys movement, progress, and growth",
    "Dynamic and energetic aesthetic",
    "Unique and modern design",
    "Strong visual metaphor for collective power"
  ],
  colors: ["Orange to yellow gradient", "Teal blend", "Purple gradient", "Accent dots"]
};

// Export with old name for compatibility
export const CircleSquadIcon = MomentumWaveIcon;
export const CircleSquadHorizontal = MomentumWaveHorizontal;
export const CircleSquadFull = MomentumWaveFull;
export const CircleSquadInfo = MomentumWaveInfo;
