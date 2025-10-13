import { cn } from "app/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Golden Abundance Icon - Sacred geometry logo featuring Golden Spirals and Vesica Piscis
 * Represents exponential growth, natural abundance, and the power of collaborative savings
 */
export function GoldenAbundanceIcon({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("logo-golden-abundance-icon", className)}
      role="img"
      aria-labelledby="golden-abundance-icon-title golden-abundance-icon-desc"
    >
      <title id="golden-abundance-icon-title">Xersha Golden Abundance Logo</title>
      <desc id="golden-abundance-icon-desc">
        Sacred geometry logo featuring golden spirals radiating from a central vesica piscis,
        symbolizing exponential growth and collaborative abundance
      </desc>

      <defs>
        {/* Primary Orange Gradient - Vibrant to Deep */}
        <radialGradient id="golden-orange-radial" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="oklch(0.85 0.18 45)" stopOpacity="1" />
          <stop offset="50%" stopColor="oklch(0.75 0.20 45)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="oklch(0.60 0.18 45)" stopOpacity="0.85" />
        </radialGradient>

        {/* Secondary Purple Gradient - Mystical Deep */}
        <radialGradient id="golden-purple-radial" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="oklch(0.75 0.20 290)" stopOpacity="0.95" />
          <stop offset="50%" stopColor="oklch(0.65 0.22 290)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.50 0.18 290)" stopOpacity="0.8" />
        </radialGradient>

        {/* Golden Spiral Gradient - Fibonacci Energy */}
        <linearGradient id="golden-spiral-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.88 0.20 45)" />
          <stop offset="38.2%" stopColor="oklch(0.78 0.22 60)" />
          <stop offset="61.8%" stopColor="oklch(0.70 0.20 290)" />
          <stop offset="100%" stopColor="oklch(0.60 0.18 290)" />
        </linearGradient>

        {/* Vesica Piscis Gradient - Sacred Union */}
        <linearGradient id="vesica-grad" x1="30%" y1="30%" x2="70%" y2="70%">
          <stop offset="0%" stopColor="oklch(0.92 0.18 45)" stopOpacity="0.3" />
          <stop offset="50%" stopColor="oklch(0.85 0.20 60)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.78 0.20 290)" stopOpacity="0.4" />
        </linearGradient>

        {/* Energy Field Gradient - Torus Flow */}
        <radialGradient id="energy-field-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.85 0.18 45)" stopOpacity="0.1" />
          <stop offset="61.8%" stopColor="oklch(0.70 0.20 290)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="oklch(0.60 0.18 290)" stopOpacity="0.05" />
        </radialGradient>

        {/* Glow Filter - Sacred Luminance */}
        <filter id="golden-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Soft Glow - Subtle Aura */}
        <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur2" />
          <feComposite in="SourceGraphic" in2="blur2" operator="over" />
        </filter>

        {/* Fibonacci Spiral Path - Golden Ratio 1.618 */}
        <path
          id="fibonacci-spiral"
          d="M 100 100
             C 100 61.8, 100 61.8, 138.2 61.8
             C 176.4 61.8, 176.4 100, 176.4 138.2
             C 176.4 214.6, 100 214.6, 23.6 214.6
             C -128.8 214.6, -128.8 -62, 100 -62
             C 328.8 -62, 328.8 290, 100 290"
          fill="none"
        />
      </defs>

      {/* Background Energy Field - Torus Pattern */}
      <g opacity="0.4">
        <circle cx="100" cy="100" r="95" fill="url(#energy-field-grad)" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="url(#golden-spiral-grad)" strokeWidth="0.5" opacity="0.3" />
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#golden-spiral-grad)" strokeWidth="0.5" opacity="0.2" />
      </g>

      {/* Vesica Piscis Foundation - Sacred Union of Two Circles */}
      <g opacity="0.6" filter="url(#soft-glow)">
        {/* Left Circle */}
        <circle cx="75" cy="100" r="45" fill="none" stroke="url(#vesica-grad)" strokeWidth="1.5" />
        {/* Right Circle */}
        <circle cx="125" cy="100" r="45" fill="none" stroke="url(#vesica-grad)" strokeWidth="1.5" />
        {/* Vesica Piscis Intersection - The Sacred Lens */}
        <path
          d="M 100 55
             A 45 45 0 0 1 100 145
             A 45 45 0 0 1 100 55 Z"
          fill="url(#vesica-grad)"
          opacity="0.4"
        />
      </g>

      {/* Primary Golden Spiral - Main Growth Curve (Clockwise) */}
      <g filter="url(#golden-glow)">
        <path
          d="M 100 100
             L 138.2 100
             A 38.2 38.2 0 0 1 138.2 138.2
             L 100 138.2
             A 61.8 61.8 0 0 1 38.2 138.2
             A 100 100 0 0 1 38.2 38.2
             A 161.8 161.8 0 0 1 200 38.2"
          fill="none"
          stroke="url(#golden-spiral-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* Secondary Golden Spiral - Counter-clockwise Balance */}
      <g filter="url(#golden-glow)" opacity="0.75">
        <path
          d="M 100 100
             L 61.8 100
             A 38.2 38.2 0 0 0 61.8 61.8
             L 100 61.8
             A 61.8 61.8 0 0 0 161.8 61.8
             A 100 100 0 0 0 161.8 161.8
             A 161.8 161.8 0 0 0 0 161.8"
          fill="none"
          stroke="url(#golden-orange-radial)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Tertiary Spiral - Purple Energy (Rotated 90°) */}
      <g filter="url(#soft-glow)" opacity="0.65" transform="rotate(90 100 100)">
        <path
          d="M 100 100
             L 138.2 100
             A 38.2 38.2 0 0 1 138.2 138.2
             L 100 138.2
             A 61.8 61.8 0 0 1 38.2 138.2"
          fill="none"
          stroke="url(#golden-purple-radial)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Quaternary Spiral - Orange Energy (Rotated 270°) */}
      <g filter="url(#soft-glow)" opacity="0.6" transform="rotate(270 100 100)">
        <path
          d="M 100 100
             L 138.2 100
             A 38.2 38.2 0 0 1 138.2 138.2
             L 100 138.2
             A 61.8 61.8 0 0 1 38.2 138.2"
          fill="none"
          stroke="url(#golden-orange-radial)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Central Sacred Geometry - Seed Point */}
      <g filter="url(#golden-glow)">
        {/* Outer Ring - Golden Ratio Circle */}
        <circle cx="100" cy="100" r="18" fill="none" stroke="url(#golden-spiral-grad)" strokeWidth="2.5" opacity="0.8" />

        {/* Inner Ring - Phi Proportion */}
        <circle cx="100" cy="100" r="11.12" fill="none" stroke="url(#golden-orange-radial)" strokeWidth="2" opacity="0.9" />

        {/* Core - Singularity Point */}
        <circle cx="100" cy="100" r="6.87" fill="url(#golden-orange-radial)" opacity="1" />

        {/* Center Highlight - Divine Spark */}
        <circle cx="100" cy="100" r="3.5" fill="oklch(0.95 0.15 60)" opacity="0.9" />

        {/* Inner Glow */}
        <circle cx="100" cy="100" r="1.5" fill="oklch(1 0.10 60)" opacity="1" />
      </g>

      {/* Fibonacci Dots - Growth Sequence */}
      <g opacity="0.7" fill="url(#golden-spiral-grad)">
        {/* Sequence: 1, 1, 2, 3, 5, 8, 13, 21 (scaled and positioned) */}
        <circle cx="120" cy="100" r="1.5" />
        <circle cx="130" cy="95" r="2" />
        <circle cx="142" cy="92" r="2.5" />
        <circle cx="155" cy="95" r="3" />
        <circle cx="165" cy="105" r="3.5" />

        {/* Mirrored sequence */}
        <circle cx="80" cy="100" r="1.5" />
        <circle cx="70" cy="105" r="2" />
        <circle cx="58" cy="108" r="2.5" />
        <circle cx="45" cy="105" r="3" />
        <circle cx="35" cy="95" r="3.5" />
      </g>

      {/* Energy Lines - Torus Flow Field */}
      <g opacity="0.25" stroke="url(#golden-spiral-grad)" strokeWidth="0.8" fill="none">
        <ellipse cx="100" cy="100" rx="65" ry="40" transform="rotate(30 100 100)" />
        <ellipse cx="100" cy="100" rx="65" ry="40" transform="rotate(-30 100 100)" />
        <ellipse cx="100" cy="100" rx="75" ry="35" transform="rotate(60 100 100)" />
        <ellipse cx="100" cy="100" rx="75" ry="35" transform="rotate(-60 100 100)" />
      </g>

      {/* Outer Sacred Boundary - Containing Circle */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="url(#golden-spiral-grad)"
        strokeWidth="1.5"
        opacity="0.4"
        strokeDasharray="5 3"
      />
    </svg>
  );
}

/**
 * Golden Abundance Horizontal - Full logo with text
 */
export function GoldenAbundanceHorizontal({ className, size = 120 }: LogoProps) {
  const iconSize = size * 0.85;

  return (
    <div
      className={cn("inline-flex items-center gap-3", className)}
      role="img"
      aria-label="Xersha - Golden Abundance Logo"
    >
      <GoldenAbundanceIcon size={iconSize} />
      <div className="flex flex-col">
        <span
          className="font-bold tracking-tight leading-none"
          style={{
            fontSize: size * 0.35,
            background: 'linear-gradient(135deg, oklch(0.75 0.20 45) 0%, oklch(0.70 0.20 60) 38.2%, oklch(0.65 0.22 290) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          XERSHA
        </span>
        <span
          className="text-xs tracking-wider opacity-70"
          style={{
            fontSize: size * 0.12,
            color: 'oklch(0.60 0.15 290)'
          }}
        >
          Save Together
        </span>
      </div>
    </div>
  );
}

/**
 * Golden Abundance Full - Complete branding layout
 */
export function GoldenAbundanceFull({ className, size = 200 }: LogoProps) {
  const iconSize = size * 0.65;

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-4", className)}
      role="img"
      aria-label="Xersha - Golden Abundance Full Logo"
    >
      <GoldenAbundanceIcon size={iconSize} />
      <div className="flex flex-col items-center">
        <span
          className="font-bold tracking-tight leading-none"
          style={{
            fontSize: size * 0.20,
            background: 'linear-gradient(135deg, oklch(0.75 0.20 45) 0%, oklch(0.70 0.20 60) 38.2%, oklch(0.65 0.22 290) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          XERSHA
        </span>
        <span
          className="tracking-widest opacity-70 mt-1"
          style={{
            fontSize: size * 0.08,
            color: 'oklch(0.60 0.15 290)',
            letterSpacing: '0.2em'
          }}
        >
          SAVE TOGETHER
        </span>
        <div
          className="mt-2 h-px w-24 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, oklch(0.70 0.20 45) 50%, transparent 100%)'
          }}
        />
      </div>
    </div>
  );
}

/**
 * Logo Information and Metadata
 */
export const GoldenAbundanceInfo = {
  name: "Golden Abundance",
  concept: "Fibonacci Spirals & Vesica Piscis",
  description:
    "A sacred geometry masterpiece combining the Golden Spiral (based on the Fibonacci sequence and golden ratio φ ≈ 1.618) with the Vesica Piscis, the sacred lens formed by two intersecting circles. Multiple spirals radiate from a central point in both clockwise and counter-clockwise directions, representing exponential growth, natural abundance, and the mathematics of prosperity. The Vesica Piscis symbolizes the unity of two becoming one—the core principle of social savings circles where individual contributions multiply into collective wealth. Fibonacci dots mark the growth sequence (1, 1, 2, 3, 5, 8, 13...), while subtle torus energy fields create dynamic flow patterns. The design embodies the principle that savings, like nature itself, follows mathematical laws of exponential expansion when nurtured in community.",
  strengths: [
    "Fibonacci spirals represent exponential growth and natural wealth accumulation",
    "Vesica Piscis symbolizes sacred union and collaborative synergy",
    "Multiple spiral directions show dynamic energy and continuous movement",
    "Golden ratio proportions create inherent visual harmony and balance",
    "Torus energy fields suggest infinite flow and abundance consciousness",
    "Fibonacci sequence dots reinforce mathematical perfection",
    "Layered complexity rewards close inspection while maintaining clarity at small sizes",
    "Deep symbolic resonance with growth, nature, and prosperity"
  ],
  colors: [
    "Primary Orange (45°) - Energy, warmth, abundance",
    "Golden Bridge (60°) - Golden ratio, prosperity",
    "Secondary Purple (290°) - Wisdom, mysticism",
    "Core Highlight - Divine spark, enlightenment"
  ]
};
