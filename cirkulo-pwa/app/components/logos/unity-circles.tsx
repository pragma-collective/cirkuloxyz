import { cn } from "app/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function UnityCirclesIcon({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="unity-circles-title"
    >
      <title id="unity-circles-title">Xersha Unity Circles Logo</title>
      <desc>Three overlapping circles representing community and shared goals</desc>

      {/* Left circle - Orange */}
      <circle
        cx="16"
        cy="24"
        r="14"
        fill="url(#unity-gradient-1)"
        opacity="0.9"
      />

      {/* Right circle - Purple */}
      <circle
        cx="32"
        cy="24"
        r="14"
        fill="url(#unity-gradient-2)"
        opacity="0.9"
      />

      {/* Center circle - Vibrant Unity Blend */}
      <circle
        cx="24"
        cy="18"
        r="12"
        fill="url(#unity-gradient-3)"
        opacity="0.92"
      />

      {/* Gradients */}
      <defs>
        <linearGradient
          id="unity-gradient-1"
          x1="16"
          y1="10"
          x2="16"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="oklch(0.72 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.58 0.16 45)" />
        </linearGradient>

        <linearGradient
          id="unity-gradient-2"
          x1="32"
          y1="10"
          x2="32"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="oklch(0.70 0.14 290)" />
          <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
        </linearGradient>

        {/* Enhanced center: Rich coral-magenta blend (true orange+purple mix) */}
        <radialGradient
          id="unity-gradient-3"
          cx="24"
          cy="18"
          r="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="oklch(0.72 0.19 355)" />
          <stop offset="50%" stopColor="oklch(0.65 0.18 350)" />
          <stop offset="100%" stopColor="oklch(0.56 0.17 345)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function UnityCirclesHorizontal({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="unity-horizontal-title"
    >
      <title id="unity-horizontal-title">Xersha Logo</title>

      {/* Logo mark */}
      <circle cx="16" cy="24" r="14" fill="url(#uh-gradient-1)" opacity="0.9" />
      <circle cx="32" cy="24" r="14" fill="url(#uh-gradient-2)" opacity="0.9" />
      <circle cx="24" cy="18" r="12" fill="url(#uh-gradient-3)" opacity="0.92" />

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
        <linearGradient id="uh-gradient-1" x1="16" y1="10" x2="16" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.72 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.58 0.16 45)" />
        </linearGradient>
        <linearGradient id="uh-gradient-2" x1="32" y1="10" x2="32" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.70 0.14 290)" />
          <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
        </linearGradient>
        <radialGradient id="uh-gradient-3" cx="24" cy="18" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.72 0.19 355)" />
          <stop offset="50%" stopColor="oklch(0.65 0.18 350)" />
          <stop offset="100%" stopColor="oklch(0.56 0.17 345)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function UnityCirclesFull({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="unity-full-title"
    >
      <title id="unity-full-title">Xersha - Save Together</title>

      {/* Logo mark */}
      <circle cx="16" cy="24" r="14" fill="url(#uf-gradient-1)" opacity="0.9" />
      <circle cx="32" cy="24" r="14" fill="url(#uf-gradient-2)" opacity="0.9" />
      <circle cx="24" cy="18" r="12" fill="url(#uf-gradient-3)" opacity="0.92" />

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
        letterSpacing="0"
      >
        Save Together
      </text>

      <defs>
        <linearGradient id="uf-gradient-1" x1="16" y1="10" x2="16" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.72 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.58 0.16 45)" />
        </linearGradient>
        <linearGradient id="uf-gradient-2" x1="32" y1="10" x2="32" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.70 0.14 290)" />
          <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
        </linearGradient>
        <radialGradient id="uf-gradient-3" cx="24" cy="18" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.72 0.19 355)" />
          <stop offset="50%" stopColor="oklch(0.65 0.18 350)" />
          <stop offset="100%" stopColor="oklch(0.56 0.17 345)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export const UnityCirclesInfo = {
  name: "Unity Circles",
  concept: "Vibrant unity through additive color blending",
  description: "Three circles intersecting to create a vibrant coral-magenta center, representing the amplified energy when community comes together. The center uses authentic color theory - where orange and purple overlap, they create a richer, more saturated focal point that symbolizes collective strength exceeding individual contributions.",
  strengths: [
    "Clean and scalable geometric design",
    "Works beautifully at small sizes (16px favicon tested)",
    "Uses only brand colors - no off-brand green/teal",
    "Strong symbolism: unity creates MORE vibrancy",
    "Radial gradient creates natural depth and focal point",
    "Scientifically accurate color mixing (orange + purple = coral-magenta)"
  ],
  colors: ["Primary Orange (45°)", "Secondary Purple (290°)", "Vibrant Coral-Magenta Center (345-355°)"],
  designRationale: "The center circle is MORE saturated (0.19 vs base 0.14-0.17) and uses coral-magenta hues (345-355°) - the true mathematical blend of orange and purple. This creates a focal point that says 'together we're stronger' - perfect for a social savings platform. The radial gradient adds depth while maintaining clarity at small sizes."
};
