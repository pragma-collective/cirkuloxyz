import { cn } from "app/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function SavingsBloomIcon({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="bloom-title"
    >
      <title id="bloom-title">Xersha Savings Bloom Logo</title>
      <desc>A stylized flower blooming from connected roots, representing community growth</desc>

      {/* Shared base/roots */}
      <path
        d="M24 40 L20 32 L24 30 L28 32 Z"
        fill="oklch(0.58 0.16 45)"
      />

      {/* Center circle */}
      <circle cx="24" cy="24" r="5" fill="url(#bloom-center)" />

      {/* Petal 1 - Top */}
      <circle cx="24" cy="12" r="6" fill="url(#bloom-petal-1)" opacity="0.9" />

      {/* Petal 2 - Top Right */}
      <circle cx="32" cy="17" r="6" fill="url(#bloom-petal-2)" opacity="0.9" />

      {/* Petal 3 - Bottom Right */}
      <circle cx="32" cy="28" r="6" fill="url(#bloom-petal-3)" opacity="0.9" />

      {/* Petal 4 - Bottom Left */}
      <circle cx="16" cy="28" r="6" fill="url(#bloom-petal-4)" opacity="0.9" />

      {/* Petal 5 - Top Left */}
      <circle cx="16" cy="17" r="6" fill="url(#bloom-petal-5)" opacity="0.9" />

      <defs>
        <radialGradient id="bloom-center">
          <stop offset="0%" stopColor="oklch(0.75 0.16 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>

        <radialGradient id="bloom-petal-1">
          <stop offset="0%" stopColor="oklch(0.75 0.14 45)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 45)" />
        </radialGradient>

        <radialGradient id="bloom-petal-2">
          <stop offset="0%" stopColor="oklch(0.72 0.15 60)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 50)" />
        </radialGradient>

        <radialGradient id="bloom-petal-3">
          <stop offset="0%" stopColor="oklch(0.72 0.15 167)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 167)" />
        </radialGradient>

        <radialGradient id="bloom-petal-4">
          <stop offset="0%" stopColor="oklch(0.72 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 290)" />
        </radialGradient>

        <radialGradient id="bloom-petal-5">
          <stop offset="0%" stopColor="oklch(0.72 0.15 270)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 280)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function SavingsBloomHorizontal({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="bloom-h-title"
    >
      <title id="bloom-h-title">Xersha Logo</title>

      {/* Logo mark - scaled and centered */}
      <g transform="translate(0, 4)">
        <path d="M24 40 L20 32 L24 30 L28 32 Z" fill="oklch(0.58 0.16 45)" />
        <circle cx="24" cy="24" r="5" fill="url(#bh-center)" />
        <circle cx="24" cy="12" r="6" fill="url(#bh-p1)" opacity="0.9" />
        <circle cx="32" cy="17" r="6" fill="url(#bh-p2)" opacity="0.9" />
        <circle cx="32" cy="28" r="6" fill="url(#bh-p3)" opacity="0.9" />
        <circle cx="16" cy="28" r="6" fill="url(#bh-p4)" opacity="0.9" />
        <circle cx="16" cy="17" r="6" fill="url(#bh-p5)" opacity="0.9" />
      </g>

      {/* Wordmark */}
      <text
        x="54"
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
        <radialGradient id="bh-center">
          <stop offset="0%" stopColor="oklch(0.75 0.16 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>
        <radialGradient id="bh-p1">
          <stop offset="0%" stopColor="oklch(0.75 0.14 45)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 45)" />
        </radialGradient>
        <radialGradient id="bh-p2">
          <stop offset="0%" stopColor="oklch(0.72 0.15 60)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 50)" />
        </radialGradient>
        <radialGradient id="bh-p3">
          <stop offset="0%" stopColor="oklch(0.72 0.15 167)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 167)" />
        </radialGradient>
        <radialGradient id="bh-p4">
          <stop offset="0%" stopColor="oklch(0.72 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 290)" />
        </radialGradient>
        <radialGradient id="bh-p5">
          <stop offset="0%" stopColor="oklch(0.72 0.15 270)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 280)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function SavingsBloomFull({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="bloom-f-title"
    >
      <title id="bloom-f-title">Xersha - Save Together</title>

      {/* Logo mark */}
      <g transform="translate(0, 4)">
        <path d="M24 40 L20 32 L24 30 L28 32 Z" fill="oklch(0.58 0.16 45)" />
        <circle cx="24" cy="24" r="5" fill="url(#bf-center)" />
        <circle cx="24" cy="12" r="6" fill="url(#bf-p1)" opacity="0.9" />
        <circle cx="32" cy="17" r="6" fill="url(#bf-p2)" opacity="0.9" />
        <circle cx="32" cy="28" r="6" fill="url(#bf-p3)" opacity="0.9" />
        <circle cx="16" cy="28" r="6" fill="url(#bf-p4)" opacity="0.9" />
        <circle cx="16" cy="17" r="6" fill="url(#bf-p5)" opacity="0.9" />
      </g>

      {/* Wordmark */}
      <text
        x="54"
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
        x="54"
        y="44"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="oklch(0.45 0.006 45)"
      >
        Save Together
      </text>

      <defs>
        <radialGradient id="bf-center">
          <stop offset="0%" stopColor="oklch(0.75 0.16 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>
        <radialGradient id="bf-p1">
          <stop offset="0%" stopColor="oklch(0.75 0.14 45)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 45)" />
        </radialGradient>
        <radialGradient id="bf-p2">
          <stop offset="0%" stopColor="oklch(0.72 0.15 60)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 50)" />
        </radialGradient>
        <radialGradient id="bf-p3">
          <stop offset="0%" stopColor="oklch(0.72 0.15 167)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 167)" />
        </radialGradient>
        <radialGradient id="bf-p4">
          <stop offset="0%" stopColor="oklch(0.72 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 290)" />
        </radialGradient>
        <radialGradient id="bf-p5">
          <stop offset="0%" stopColor="oklch(0.72 0.15 270)" />
          <stop offset="100%" stopColor="oklch(0.58 0.16 280)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export const SavingsBloomInfo = {
  name: "Savings Bloom",
  concept: "Organic growth metaphor",
  description: "A stylized flower with five circular petals growing from connected roots. Represents community-powered growth and the flourishing of shared financial goals. Each petal symbolizes a member contributing to collective prosperity.",
  strengths: [
    "Unique and distinctive design",
    "Strong growth/prosperity symbolism",
    "Colorful and engaging",
    "Conveys organic, natural progress"
  ],
  colors: ["Orange center", "Multi-hue petals", "Gradient transitions"]
};
