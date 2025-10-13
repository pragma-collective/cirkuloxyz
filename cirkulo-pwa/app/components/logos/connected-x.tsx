import { cn } from "app/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function ConnectedXIcon({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="connected-x-title"
    >
      <title id="connected-x-title">Xersha Connected X Logo</title>
      <desc>Stylized X formed by connecting shapes, representing unity and connection</desc>

      {/* Left arc - Orange */}
      <path
        d="M8 8 Q14 14 14 24 Q14 34 8 40 L16 40 Q22 34 22 24 Q22 14 16 8 Z"
        fill="url(#cx-gradient-1)"
      />

      {/* Right arc - Purple */}
      <path
        d="M40 8 Q34 14 34 24 Q34 34 40 40 L32 40 Q26 34 26 24 Q26 14 32 8 Z"
        fill="url(#cx-gradient-2)"
      />

      {/* Center connection circle */}
      <circle
        cx="24"
        cy="24"
        r="6"
        fill="url(#cx-center)"
      />

      <defs>
        <linearGradient
          id="cx-gradient-1"
          x1="12"
          y1="8"
          x2="12"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="oklch(0.75 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.58 0.16 45)" />
        </linearGradient>

        <linearGradient
          id="cx-gradient-2"
          x1="36"
          y1="8"
          x2="36"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="oklch(0.70 0.14 290)" />
          <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
        </linearGradient>

        <radialGradient id="cx-center">
          <stop offset="0%" stopColor="oklch(0.72 0.15 167)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 167)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ConnectedXHorizontal({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="cx-h-title"
    >
      <title id="cx-h-title">Xersha Logo</title>

      {/* Logo mark */}
      <path
        d="M8 8 Q14 14 14 24 Q14 34 8 40 L16 40 Q22 34 22 24 Q22 14 16 8 Z"
        fill="url(#cxh-gradient-1)"
      />
      <path
        d="M40 8 Q34 14 34 24 Q34 34 40 40 L32 40 Q26 34 26 24 Q26 14 32 8 Z"
        fill="url(#cxh-gradient-2)"
      />
      <circle cx="24" cy="24" r="6" fill="url(#cxh-center)" />

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
        <linearGradient id="cxh-gradient-1" x1="12" y1="8" x2="12" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.58 0.16 45)" />
        </linearGradient>
        <linearGradient id="cxh-gradient-2" x1="36" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.70 0.14 290)" />
          <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
        </linearGradient>
        <radialGradient id="cxh-center">
          <stop offset="0%" stopColor="oklch(0.72 0.15 167)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 167)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ConnectedXFull({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="cx-f-title"
    >
      <title id="cx-f-title">Xersha - Save Together</title>

      {/* Logo mark */}
      <path
        d="M8 8 Q14 14 14 24 Q14 34 8 40 L16 40 Q22 34 22 24 Q22 14 16 8 Z"
        fill="url(#cxf-gradient-1)"
      />
      <path
        d="M40 8 Q34 14 34 24 Q34 34 40 40 L32 40 Q26 34 26 24 Q26 14 32 8 Z"
        fill="url(#cxf-gradient-2)"
      />
      <circle cx="24" cy="24" r="6" fill="url(#cxf-center)" />

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
        <linearGradient id="cxf-gradient-1" x1="12" y1="8" x2="12" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.58 0.16 45)" />
        </linearGradient>
        <linearGradient id="cxf-gradient-2" x1="36" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.70 0.14 290)" />
          <stop offset="1" stopColor="oklch(0.52 0.16 290)" />
        </linearGradient>
        <radialGradient id="cxf-center">
          <stop offset="0%" stopColor="oklch(0.72 0.15 167)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 167)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export const ConnectedXInfo = {
  name: "Connected X",
  concept: "Bold letterform monogram",
  description: "A stylized X formed by two connecting arcs that meet at the center. The negative space and flow represent connection, while the strong X shape creates a memorable, modern brand mark. Perfect for app icons.",
  strengths: [
    "Bold and memorable letterform",
    "Excellent as app icon",
    "Modern and scalable",
    "Strong brand recognition potential"
  ],
  colors: ["Orange left", "Purple right", "Blended center"]
};
