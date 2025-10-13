import { cn } from "app/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function CircleSquadIcon({ className, size = 48 }: LogoProps) {
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
      <desc>Dynamic upward waves representing collective momentum and growth</desc>

      {/* Character 1 - Top (Orange) */}
      <g>
        <circle cx="24" cy="12" r="5" fill="url(#squad-1-face)" />
        <circle cx="24" cy="18" r="3" fill="url(#squad-1-body)" />
      </g>

      {/* Character 2 - Right (Purple) */}
      <g>
        <circle cx="34" cy="24" r="5" fill="url(#squad-2-face)" />
        <circle cx="30" cy="28" r="3" fill="url(#squad-2-body)" />
      </g>

      {/* Character 3 - Bottom (Teal) */}
      <g>
        <circle cx="24" cy="36" r="5" fill="url(#squad-3-face)" />
        <circle cx="24" cy="30" r="3" fill="url(#squad-3-body)" />
      </g>

      {/* Character 4 - Left (Pink/Orange) */}
      <g>
        <circle cx="14" cy="24" r="5" fill="url(#squad-4-face)" />
        <circle cx="18" cy="28" r="3" fill="url(#squad-4-body)" />
      </g>

      {/* Center connection circle */}
      <circle cx="24" cy="24" r="4" fill="oklch(0.98 0.002 45)" stroke="oklch(0.65 0.17 45)" strokeWidth="2" />

      {/* Smiley faces */}
      <g>
        <circle cx="22.5" cy="11" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="25.5" cy="11" r="0.8" fill="oklch(0.25 0.004 45)" />
        <path d="M22 13.5 Q24 14.5 26 13.5" stroke="oklch(0.25 0.004 45)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>

      <g>
        <circle cx="32.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="35.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <path d="M32 25.5 Q34 26.5 36 25.5" stroke="oklch(0.25 0.004 45)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>

      <g>
        <circle cx="22.5" cy="35" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="25.5" cy="35" r="0.8" fill="oklch(0.25 0.004 45)" />
        <path d="M22 37.5 Q24 38.5 26 37.5" stroke="oklch(0.25 0.004 45)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>

      <g>
        <circle cx="12.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="15.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <path d="M12 25.5 Q14 26.5 16 25.5" stroke="oklch(0.25 0.004 45)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>

      <defs>
        <radialGradient id="squad-1-face">
          <stop offset="0%" stopColor="oklch(0.75 0.14 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>
        <radialGradient id="squad-1-body">
          <stop offset="0%" stopColor="oklch(0.70 0.15 45)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 45)" />
        </radialGradient>

        <radialGradient id="squad-2-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 290)" />
          <stop offset="100%" stopColor="oklch(0.60 0.17 290)" />
        </radialGradient>
        <radialGradient id="squad-2-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 290)" />
        </radialGradient>

        <radialGradient id="squad-3-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 180)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 180)" />
        </radialGradient>
        <radialGradient id="squad-3-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 180)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 180)" />
        </radialGradient>

        <radialGradient id="squad-4-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 15)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 15)" />
        </radialGradient>
        <radialGradient id="squad-4-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 15)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 15)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function CircleSquadHorizontal({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="squad-h-title"
    >
      <title id="squad-h-title">Xersha Logo</title>

      {/* Logo mark */}
      <g>
        <circle cx="24" cy="12" r="5" fill="url(#sh-1-face)" />
        <circle cx="24" cy="18" r="3" fill="url(#sh-1-body)" />
        <circle cx="34" cy="24" r="5" fill="url(#sh-2-face)" />
        <circle cx="30" cy="28" r="3" fill="url(#sh-2-body)" />
        <circle cx="24" cy="36" r="5" fill="url(#sh-3-face)" />
        <circle cx="24" cy="30" r="3" fill="url(#sh-3-body)" />
        <circle cx="14" cy="24" r="5" fill="url(#sh-4-face)" />
        <circle cx="18" cy="28" r="3" fill="url(#sh-4-body)" />
        <circle cx="24" cy="24" r="4" fill="oklch(0.98 0.002 45)" stroke="oklch(0.65 0.17 45)" strokeWidth="2" />

        {/* Simplified smiles */}
        <circle cx="22.5" cy="11" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="25.5" cy="11" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="32.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="35.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="22.5" cy="35" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="25.5" cy="35" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="12.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="15.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
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
        <radialGradient id="sh-1-face">
          <stop offset="0%" stopColor="oklch(0.75 0.14 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>
        <radialGradient id="sh-1-body">
          <stop offset="0%" stopColor="oklch(0.70 0.15 45)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 45)" />
        </radialGradient>
        <radialGradient id="sh-2-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 290)" />
          <stop offset="100%" stopColor="oklch(0.60 0.17 290)" />
        </radialGradient>
        <radialGradient id="sh-2-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 290)" />
        </radialGradient>
        <radialGradient id="sh-3-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 180)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 180)" />
        </radialGradient>
        <radialGradient id="sh-3-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 180)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 180)" />
        </radialGradient>
        <radialGradient id="sh-4-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 15)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 15)" />
        </radialGradient>
        <radialGradient id="sh-4-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 15)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 15)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function CircleSquadFull({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="squad-f-title"
    >
      <title id="squad-f-title">Xersha - Save Together</title>

      {/* Logo mark */}
      <g>
        <circle cx="24" cy="12" r="5" fill="url(#sf-1-face)" />
        <circle cx="24" cy="18" r="3" fill="url(#sf-1-body)" />
        <circle cx="34" cy="24" r="5" fill="url(#sf-2-face)" />
        <circle cx="30" cy="28" r="3" fill="url(#sf-2-body)" />
        <circle cx="24" cy="36" r="5" fill="url(#sf-3-face)" />
        <circle cx="24" cy="30" r="3" fill="url(#sf-3-body)" />
        <circle cx="14" cy="24" r="5" fill="url(#sf-4-face)" />
        <circle cx="18" cy="28" r="3" fill="url(#sf-4-body)" />
        <circle cx="24" cy="24" r="4" fill="oklch(0.98 0.002 45)" stroke="oklch(0.65 0.17 45)" strokeWidth="2" />

        <circle cx="22.5" cy="11" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="25.5" cy="11" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="32.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="35.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="22.5" cy="35" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="25.5" cy="35" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="12.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
        <circle cx="15.5" cy="23" r="0.8" fill="oklch(0.25 0.004 45)" />
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
        <radialGradient id="sf-1-face">
          <stop offset="0%" stopColor="oklch(0.75 0.14 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>
        <radialGradient id="sf-1-body">
          <stop offset="0%" stopColor="oklch(0.70 0.15 45)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 45)" />
        </radialGradient>
        <radialGradient id="sf-2-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 290)" />
          <stop offset="100%" stopColor="oklch(0.60 0.17 290)" />
        </radialGradient>
        <radialGradient id="sf-2-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 290)" />
        </radialGradient>
        <radialGradient id="sf-3-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 180)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 180)" />
        </radialGradient>
        <radialGradient id="sf-3-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 180)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 180)" />
        </radialGradient>
        <radialGradient id="sf-4-face">
          <stop offset="0%" stopColor="oklch(0.72 0.14 15)" />
          <stop offset="100%" stopColor="oklch(0.60 0.16 15)" />
        </radialGradient>
        <radialGradient id="sf-4-body">
          <stop offset="0%" stopColor="oklch(0.67 0.15 15)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 15)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export const CircleSquadInfo = {
  name: "Circle Squad",
  concept: "Playful character-based",
  description: "Four friendly characters arranged in a protective circle formation. Each character has a unique color representing diversity and inclusivity. The smiling faces and circle arrangement convey community, friendship, and the joy of saving together.",
  strengths: [
    "Most personality-driven and friendly",
    "Appeals to Gen Z/millennial audience",
    "Unique and memorable",
    "Emoji-inspired aesthetic"
  ],
  colors: ["Orange", "Purple", "Teal", "Coral"]
};
