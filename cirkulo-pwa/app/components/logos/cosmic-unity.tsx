import { cn } from "app/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function CosmicUnityIcon({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="cosmic-unity-title"
    >
      <title id="cosmic-unity-title">Xersha Cosmic Unity Logo</title>
      <desc>Sacred geometry consciousness network representing transcendent collective unity</desc>

      <defs>
        {/* Radial gradient for cosmic orange center */}
        <radialGradient id="cosmic-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.80 0.15 45)" stopOpacity="1" />
          <stop offset="40%" stopColor="oklch(0.75 0.14 45)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="oklch(0.65 0.13 45)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.55 0.12 45)" stopOpacity="0.3" />
        </radialGradient>

        {/* Radial gradient for purple outer energy */}
        <radialGradient id="cosmic-outer" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="oklch(0.70 0.15 290)" stopOpacity="0" />
          <stop offset="50%" stopColor="oklch(0.65 0.14 290)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.55 0.13 290)" stopOpacity="0.9" />
        </radialGradient>

        {/* Energy field gradient */}
        <radialGradient id="energy-field" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.85 0.16 45)" stopOpacity="0.8" />
          <stop offset="60%" stopColor="oklch(0.70 0.15 290)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.60 0.14 290)" stopOpacity="0" />
        </radialGradient>

        {/* Sacred geometry stroke gradient */}
        <linearGradient id="sacred-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.85 0.16 45)" />
          <stop offset="50%" stopColor="oklch(0.75 0.15 315)" />
          <stop offset="100%" stopColor="oklch(0.70 0.15 290)" />
        </linearGradient>

        {/* Consciousness network gradient */}
        <linearGradient id="network-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.80 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.75 0.15 45)" />
        </linearGradient>

        {/* Ethereal glow filter */}
        <filter id="ethereal-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft luminescence */}
        <filter id="soft-light" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
        </filter>
      </defs>

      {/* Outer cosmic field - transcendent purple energy */}
      <circle cx="64" cy="64" r="58" fill="url(#cosmic-outer)" opacity="0.6" />

      {/* Sacred geometry - outer hexagram (Star of David) */}
      <path
        d="M 64 16 L 84.78 36.5 L 84.78 36.5 L 102.78 36.5 L 112.17 54 L 102.78 71.5 L 84.78 71.5 L 64 92 L 43.22 71.5 L 25.22 71.5 L 15.83 54 L 25.22 36.5 L 43.22 36.5 Z"
        fill="none"
        stroke="url(#sacred-stroke)"
        strokeWidth="0.5"
        opacity="0.4"
        filter="url(#soft-light)"
      />

      {/* Energy rings - multiple dimensions */}
      <circle cx="64" cy="64" r="52" fill="none" stroke="oklch(0.75 0.15 290)" strokeWidth="0.3" opacity="0.5" filter="url(#soft-light)" />
      <circle cx="64" cy="64" r="46" fill="none" stroke="oklch(0.78 0.15 315)" strokeWidth="0.4" opacity="0.6" filter="url(#soft-light)" />
      <circle cx="64" cy="64" r="40" fill="none" stroke="oklch(0.80 0.15 45)" strokeWidth="0.5" opacity="0.7" />

      {/* Sacred geometry - inner dodecagon (12-sided, representing completeness) */}
      <path
        d="M 64 28 L 78.93 33.07 L 89.6 44.4 L 94.67 59.33 L 94.67 68.67 L 89.6 83.6 L 78.93 94.93 L 64 100 L 49.07 94.93 L 38.4 83.6 L 33.33 68.67 L 33.33 59.33 L 38.4 44.4 L 49.07 33.07 Z"
        fill="url(#energy-field)"
        stroke="url(#sacred-stroke)"
        strokeWidth="0.8"
        opacity="0.8"
        filter="url(#ethereal-glow)"
      />

      {/* Consciousness network - interconnected nodes */}
      <circle cx="64" cy="34" r="2.5" fill="url(#network-glow)" filter="url(#ethereal-glow)" />
      <circle cx="85.5" cy="47" r="2.5" fill="url(#network-glow)" filter="url(#ethereal-glow)" />
      <circle cx="85.5" cy="81" r="2.5" fill="url(#network-glow)" filter="url(#ethereal-glow)" />
      <circle cx="64" cy="94" r="2.5" fill="url(#network-glow)" filter="url(#ethereal-glow)" />
      <circle cx="42.5" cy="81" r="2.5" fill="url(#network-glow)" filter="url(#ethereal-glow)" />
      <circle cx="42.5" cy="47" r="2.5" fill="url(#network-glow)" filter="url(#ethereal-glow)" />

      {/* Energy lines connecting consciousness nodes */}
      <path
        d="M 64 34 L 85.5 47 L 85.5 81 L 64 94 L 42.5 81 L 42.5 47 Z"
        fill="none"
        stroke="url(#sacred-stroke)"
        strokeWidth="0.6"
        opacity="0.7"
        filter="url(#soft-light)"
      />

      {/* Inner sacred geometry - Seed of Life pattern */}
      <circle cx="64" cy="64" r="12" fill="none" stroke="oklch(0.85 0.16 45)" strokeWidth="1" opacity="0.9" filter="url(#ethereal-glow)" />
      <circle cx="64" cy="52" r="12" fill="none" stroke="oklch(0.85 0.16 45)" strokeWidth="0.8" opacity="0.7" />
      <circle cx="74.39" cy="58" r="12" fill="none" stroke="oklch(0.80 0.15 315)" strokeWidth="0.8" opacity="0.7" />
      <circle cx="74.39" cy="70" r="12" fill="none" stroke="oklch(0.75 0.15 290)" strokeWidth="0.8" opacity="0.7" />
      <circle cx="64" cy="76" r="12" fill="none" stroke="oklch(0.75 0.15 290)" strokeWidth="0.8" opacity="0.7" />
      <circle cx="53.61" cy="70" r="12" fill="none" stroke="oklch(0.78 0.15 315)" strokeWidth="0.8" opacity="0.7" />
      <circle cx="53.61" cy="58" r="12" fill="none" stroke="oklch(0.80 0.15 45)" strokeWidth="0.8" opacity="0.7" />

      {/* Central point - the source of cosmic unity */}
      <circle cx="64" cy="64" r="8" fill="url(#cosmic-center)" filter="url(#ethereal-glow)" />

      {/* Third eye / enlightenment center */}
      <circle cx="64" cy="64" r="4" fill="oklch(0.95 0.10 45)" opacity="0.9" filter="url(#ethereal-glow)" />

      {/* Innermost point - pure consciousness */}
      <circle cx="64" cy="64" r="1.5" fill="oklch(1.0 0.05 45)" filter="url(#ethereal-glow)" />

      {/* Subtle energy rays emanating from center */}
      <g opacity="0.3">
        <line x1="64" y1="64" x2="64" y2="20" stroke="url(#sacred-stroke)" strokeWidth="0.3" />
        <line x1="64" y1="64" x2="98" y2="38" stroke="url(#sacred-stroke)" strokeWidth="0.3" />
        <line x1="64" y1="64" x2="98" y2="90" stroke="url(#sacred-stroke)" strokeWidth="0.3" />
        <line x1="64" y1="64" x2="64" y2="108" stroke="url(#sacred-stroke)" strokeWidth="0.3" />
        <line x1="64" y1="64" x2="30" y2="90" stroke="url(#sacred-stroke)" strokeWidth="0.3" />
        <line x1="64" y1="64" x2="30" y2="38" stroke="url(#sacred-stroke)" strokeWidth="0.3" />
      </g>
    </svg>
  );
}

export function CosmicUnityHorizontal({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="cosmic-unity-h-title"
    >
      <title id="cosmic-unity-h-title">Xersha Logo</title>

      <defs>
        <radialGradient id="h-cosmic-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.80 0.15 45)" stopOpacity="1" />
          <stop offset="40%" stopColor="oklch(0.75 0.14 45)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="oklch(0.65 0.13 45)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.55 0.12 45)" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="h-cosmic-outer" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="oklch(0.70 0.15 290)" stopOpacity="0" />
          <stop offset="50%" stopColor="oklch(0.65 0.14 290)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.55 0.13 290)" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="h-energy-field" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.85 0.16 45)" stopOpacity="0.8" />
          <stop offset="60%" stopColor="oklch(0.70 0.15 290)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.60 0.14 290)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="h-sacred-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.85 0.16 45)" />
          <stop offset="50%" stopColor="oklch(0.75 0.15 315)" />
          <stop offset="100%" stopColor="oklch(0.70 0.15 290)" />
        </linearGradient>
        <linearGradient id="h-network-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.80 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.75 0.15 45)" />
        </linearGradient>
        <filter id="h-ethereal-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="h-soft-light" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
        </filter>
      </defs>

      {/* Scaled down icon */}
      <g transform="scale(0.5) translate(0, 0)">
        <circle cx="64" cy="64" r="58" fill="url(#h-cosmic-outer)" opacity="0.6" />
        <path
          d="M 64 16 L 84.78 36.5 L 102.78 36.5 L 112.17 54 L 102.78 71.5 L 84.78 71.5 L 64 92 L 43.22 71.5 L 25.22 71.5 L 15.83 54 L 25.22 36.5 L 43.22 36.5 Z"
          fill="none"
          stroke="url(#h-sacred-stroke)"
          strokeWidth="0.5"
          opacity="0.4"
        />
        <circle cx="64" cy="64" r="40" fill="none" stroke="oklch(0.80 0.15 45)" strokeWidth="0.5" opacity="0.7" />
        <path
          d="M 64 28 L 78.93 33.07 L 89.6 44.4 L 94.67 59.33 L 94.67 68.67 L 89.6 83.6 L 78.93 94.93 L 64 100 L 49.07 94.93 L 38.4 83.6 L 33.33 68.67 L 33.33 59.33 L 38.4 44.4 L 49.07 33.07 Z"
          fill="url(#h-energy-field)"
          stroke="url(#h-sacred-stroke)"
          strokeWidth="0.8"
          opacity="0.8"
          filter="url(#h-ethereal-glow)"
        />
        <circle cx="64" cy="34" r="2.5" fill="url(#h-network-glow)" filter="url(#h-ethereal-glow)" />
        <circle cx="85.5" cy="47" r="2.5" fill="url(#h-network-glow)" filter="url(#h-ethereal-glow)" />
        <circle cx="85.5" cy="81" r="2.5" fill="url(#h-network-glow)" filter="url(#h-ethereal-glow)" />
        <circle cx="64" cy="94" r="2.5" fill="url(#h-network-glow)" filter="url(#h-ethereal-glow)" />
        <circle cx="42.5" cy="81" r="2.5" fill="url(#h-network-glow)" filter="url(#h-ethereal-glow)" />
        <circle cx="42.5" cy="47" r="2.5" fill="url(#h-network-glow)" filter="url(#h-ethereal-glow)" />
        <path
          d="M 64 34 L 85.5 47 L 85.5 81 L 64 94 L 42.5 81 L 42.5 47 Z"
          fill="none"
          stroke="url(#h-sacred-stroke)"
          strokeWidth="0.6"
          opacity="0.7"
        />
        <circle cx="64" cy="64" r="12" fill="none" stroke="oklch(0.85 0.16 45)" strokeWidth="1" opacity="0.9" filter="url(#h-ethereal-glow)" />
        <circle cx="64" cy="64" r="8" fill="url(#h-cosmic-center)" filter="url(#h-ethereal-glow)" />
        <circle cx="64" cy="64" r="4" fill="oklch(0.95 0.10 45)" opacity="0.9" filter="url(#h-ethereal-glow)" />
        <circle cx="64" cy="64" r="1.5" fill="oklch(1.0 0.05 45)" filter="url(#h-ethereal-glow)" />
      </g>

      {/* Wordmark */}
      <text
        x="78"
        y="40"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="oklch(0.25 0.004 45)"
        letterSpacing="-0.5"
      >
        Xersha
      </text>
    </svg>
  );
}

export function CosmicUnityFull({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="cosmic-unity-f-title"
    >
      <title id="cosmic-unity-f-title">Xersha - Save Together</title>

      <defs>
        <radialGradient id="f-cosmic-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.80 0.15 45)" stopOpacity="1" />
          <stop offset="40%" stopColor="oklch(0.75 0.14 45)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="oklch(0.65 0.13 45)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.55 0.12 45)" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="f-cosmic-outer" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="oklch(0.70 0.15 290)" stopOpacity="0" />
          <stop offset="50%" stopColor="oklch(0.65 0.14 290)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.55 0.13 290)" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="f-energy-field" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.85 0.16 45)" stopOpacity="0.8" />
          <stop offset="60%" stopColor="oklch(0.70 0.15 290)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.60 0.14 290)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="f-sacred-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.85 0.16 45)" />
          <stop offset="50%" stopColor="oklch(0.75 0.15 315)" />
          <stop offset="100%" stopColor="oklch(0.70 0.15 290)" />
        </linearGradient>
        <linearGradient id="f-network-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.80 0.15 290)" />
          <stop offset="100%" stopColor="oklch(0.75 0.15 45)" />
        </linearGradient>
        <filter id="f-ethereal-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="f-soft-light" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
        </filter>
      </defs>

      {/* Scaled down icon */}
      <g transform="scale(0.5) translate(0, 16)">
        <circle cx="64" cy="64" r="58" fill="url(#f-cosmic-outer)" opacity="0.6" />
        <path
          d="M 64 16 L 84.78 36.5 L 102.78 36.5 L 112.17 54 L 102.78 71.5 L 84.78 71.5 L 64 92 L 43.22 71.5 L 25.22 71.5 L 15.83 54 L 25.22 36.5 L 43.22 36.5 Z"
          fill="none"
          stroke="url(#f-sacred-stroke)"
          strokeWidth="0.5"
          opacity="0.4"
        />
        <circle cx="64" cy="64" r="40" fill="none" stroke="oklch(0.80 0.15 45)" strokeWidth="0.5" opacity="0.7" />
        <path
          d="M 64 28 L 78.93 33.07 L 89.6 44.4 L 94.67 59.33 L 94.67 68.67 L 89.6 83.6 L 78.93 94.93 L 64 100 L 49.07 94.93 L 38.4 83.6 L 33.33 68.67 L 33.33 59.33 L 38.4 44.4 L 49.07 33.07 Z"
          fill="url(#f-energy-field)"
          stroke="url(#f-sacred-stroke)"
          strokeWidth="0.8"
          opacity="0.8"
          filter="url(#f-ethereal-glow)"
        />
        <circle cx="64" cy="34" r="2.5" fill="url(#f-network-glow)" filter="url(#f-ethereal-glow)" />
        <circle cx="85.5" cy="47" r="2.5" fill="url(#f-network-glow)" filter="url(#f-ethereal-glow)" />
        <circle cx="85.5" cy="81" r="2.5" fill="url(#f-network-glow)" filter="url(#f-ethereal-glow)" />
        <circle cx="64" cy="94" r="2.5" fill="url(#f-network-glow)" filter="url(#f-ethereal-glow)" />
        <circle cx="42.5" cy="81" r="2.5" fill="url(#f-network-glow)" filter="url(#f-ethereal-glow)" />
        <circle cx="42.5" cy="47" r="2.5" fill="url(#f-network-glow)" filter="url(#f-ethereal-glow)" />
        <path
          d="M 64 34 L 85.5 47 L 85.5 81 L 64 94 L 42.5 81 L 42.5 47 Z"
          fill="none"
          stroke="url(#f-sacred-stroke)"
          strokeWidth="0.6"
          opacity="0.7"
        />
        <circle cx="64" cy="64" r="12" fill="none" stroke="oklch(0.85 0.16 45)" strokeWidth="1" opacity="0.9" filter="url(#f-ethereal-glow)" />
        <circle cx="64" cy="64" r="8" fill="url(#f-cosmic-center)" filter="url(#f-ethereal-glow)" />
        <circle cx="64" cy="64" r="4" fill="oklch(0.95 0.10 45)" opacity="0.9" filter="url(#f-ethereal-glow)" />
        <circle cx="64" cy="64" r="1.5" fill="oklch(1.0 0.05 45)" filter="url(#f-ethereal-glow)" />
      </g>

      {/* Wordmark */}
      <text
        x="78"
        y="40"
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
        x="78"
        y="56"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="oklch(0.45 0.006 45)"
        letterSpacing="0"
      >
        Save Together
      </text>
    </svg>
  );
}

export const CosmicUnityInfo = {
  name: "Cosmic Unity",
  concept: "Sacred Geometry Consciousness Network",
  description: "Channeling Alex Grey's visionary aesthetic, this logo represents the transcendent moment when individual consciousness merges into collective unity. The design layers sacred geometric patterns - the Seed of Life, dodecagon, and hexagram - symbolizing universal interconnectedness. Six consciousness nodes form a network of souls united in purpose, while concentric energy rings represent multiple dimensions of existence. The central luminous point embodies pure awareness, radiating outward through translucent energy fields.",
  strengths: [
    "Sacred Geometry Foundation: Seed of Life pattern at core (fundamental creation symbol)",
    "Multi-Dimensional Layering: Translucent overlapping forms show simultaneous planes of existence",
    "Consciousness Network: Six nodes in hexagonal arrangement with energy connection lines",
    "Transcendent Color Journey: Orange-to-purple gradient (material to spiritual transformation)",
    "Ethereal Luminescence: SVG filters create Alex Grey's signature self-emitting light quality",
    "Radiant Energy: Subtle rays emanate from center showing collective energy expansion",
    "Sacred Proportions: 12-sided dodecagon represents completeness and wholeness",
    "Scales Beautifully: Complex at large sizes, remains recognizable cosmic symbol at small sizes"
  ],
  colors: [
    "Cosmic Orange Core (45°) - Life force energy",
    "Transcendent Purple Field (290°) - Spiritual wisdom",
    "Unity Spectrum Bridge (315°) - Transformation zone",
    "Pure Consciousness White - Enlightenment center"
  ]
};
