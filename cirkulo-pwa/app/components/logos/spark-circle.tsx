import { cn } from "app/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function SparkCircleIcon({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="spark-title"
    >
      <title id="spark-title">Xersha Spark Circle Logo</title>
      <desc>A radiant circle of connected nodes representing the moment friends unite to create powerful collective momentum</desc>

      {/* Main circular ring - represents unity and protection */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="url(#spark-ring-gradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />

      {/* Connection lines forming sacred geometry */}
      {/* Top to Bottom-Right */}
      <line
        x1="24"
        y1="6"
        x2="39.2"
        y2="30"
        stroke="url(#spark-line-1)"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Top to Bottom-Left */}
      <line
        x1="24"
        y1="6"
        x2="8.8"
        y2="30"
        stroke="url(#spark-line-2)"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Bottom-Right to Left */}
      <line
        x1="39.2"
        y1="30"
        x2="6"
        y2="24"
        stroke="url(#spark-line-3)"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Bottom-Left to Right */}
      <line
        x1="8.8"
        y1="30"
        x2="42"
        y2="24"
        stroke="url(#spark-line-4)"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Left to Bottom-Right */}
      <line
        x1="6"
        y1="24"
        x2="39.2"
        y2="30"
        stroke="url(#spark-line-5)"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Right to Bottom-Left */}
      <line
        x1="42"
        y1="24"
        x2="8.8"
        y2="30"
        stroke="url(#spark-line-6)"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Central spark - the moment of unity */}
      <g filter="url(#spark-glow)">
        {/* Spark rays */}
        <path
          d="M24 18 L25 22 L29 22 L26 25 L27 29 L24 27 L21 29 L22 25 L19 22 L23 22 Z"
          fill="url(#spark-center-gradient)"
        />
        {/* Central circle */}
        <circle cx="24" cy="24" r="3" fill="url(#spark-core-gradient)" />
      </g>

      {/* Node 1 - Top (golden ratio position) */}
      <circle
        cx="24"
        cy="6"
        r="3.5"
        fill="url(#node-gradient-1)"
        stroke="oklch(0.85 0.14 45)"
        strokeWidth="1.5"
      />

      {/* Node 2 - Right */}
      <circle
        cx="42"
        cy="24"
        r="3.5"
        fill="url(#node-gradient-2)"
        stroke="oklch(0.75 0.16 60)"
        strokeWidth="1.5"
      />

      {/* Node 3 - Bottom Right */}
      <circle
        cx="39.2"
        cy="30"
        r="3"
        fill="url(#node-gradient-3)"
        stroke="oklch(0.70 0.16 200)"
        strokeWidth="1.5"
      />

      {/* Node 4 - Bottom Left */}
      <circle
        cx="8.8"
        cy="30"
        r="3"
        fill="url(#node-gradient-4)"
        stroke="oklch(0.68 0.17 270)"
        strokeWidth="1.5"
      />

      {/* Node 5 - Left */}
      <circle
        cx="6"
        cy="24"
        r="3.5"
        fill="url(#node-gradient-5)"
        stroke="oklch(0.65 0.17 290)"
        strokeWidth="1.5"
      />

      {/* Accent sparkles - suggesting energy and excitement */}
      <circle cx="18" cy="10" r="1" fill="oklch(0.80 0.14 45)" opacity="0.8" />
      <circle cx="30" cy="10" r="1.2" fill="oklch(0.75 0.16 60)" opacity="0.9" />
      <circle cx="38" cy="18" r="0.8" fill="oklch(0.70 0.16 200)" opacity="0.7" />
      <circle cx="38" cy="30" r="1" fill="oklch(0.68 0.17 270)" opacity="0.8" />
      <circle cx="10" cy="30" r="1.2" fill="oklch(0.65 0.17 290)" opacity="0.9" />
      <circle cx="10" cy="18" r="0.8" fill="oklch(0.75 0.16 45)" opacity="0.7" />

      <defs>
        {/* Central spark gradients */}
        <radialGradient id="spark-core-gradient">
          <stop offset="0%" stopColor="oklch(0.95 0.12 45)" />
          <stop offset="50%" stopColor="oklch(0.75 0.17 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>

        <linearGradient
          id="spark-center-gradient"
          x1="24"
          y1="18"
          x2="24"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="oklch(0.85 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 60)" />
        </linearGradient>

        {/* Ring gradient */}
        <linearGradient
          id="spark-ring-gradient"
          x1="6"
          y1="24"
          x2="42"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="0.33" stopColor="oklch(0.70 0.16 167)" />
          <stop offset="0.66" stopColor="oklch(0.65 0.17 290)" />
          <stop offset="1" stopColor="oklch(0.75 0.15 45)" />
        </linearGradient>

        {/* Connection line gradients */}
        <linearGradient id="spark-line-1" x1="24" y1="6" x2="39.2" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 200)" />
        </linearGradient>

        <linearGradient id="spark-line-2" x1="24" y1="6" x2="8.8" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="1" stopColor="oklch(0.68 0.17 270)" />
        </linearGradient>

        <linearGradient id="spark-line-3" x1="39.2" y1="30" x2="6" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.70 0.16 200)" />
          <stop offset="1" stopColor="oklch(0.65 0.17 290)" />
        </linearGradient>

        <linearGradient id="spark-line-4" x1="8.8" y1="30" x2="42" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.68 0.17 270)" />
          <stop offset="1" stopColor="oklch(0.75 0.16 60)" />
        </linearGradient>

        <linearGradient id="spark-line-5" x1="6" y1="24" x2="39.2" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.65 0.17 290)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 200)" />
        </linearGradient>

        <linearGradient id="spark-line-6" x1="42" y1="24" x2="8.8" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.16 60)" />
          <stop offset="1" stopColor="oklch(0.68 0.17 270)" />
        </linearGradient>

        {/* Node gradients - each unique */}
        <radialGradient id="node-gradient-1">
          <stop offset="0%" stopColor="oklch(0.95 0.10 45)" />
          <stop offset="100%" stopColor="oklch(0.75 0.15 45)" />
        </radialGradient>

        <radialGradient id="node-gradient-2">
          <stop offset="0%" stopColor="oklch(0.92 0.12 60)" />
          <stop offset="100%" stopColor="oklch(0.72 0.16 60)" />
        </radialGradient>

        <radialGradient id="node-gradient-3">
          <stop offset="0%" stopColor="oklch(0.88 0.13 167)" />
          <stop offset="100%" stopColor="oklch(0.68 0.16 167)" />
        </radialGradient>

        <radialGradient id="node-gradient-4">
          <stop offset="0%" stopColor="oklch(0.85 0.14 270)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 270)" />
        </radialGradient>

        <radialGradient id="node-gradient-5">
          <stop offset="0%" stopColor="oklch(0.85 0.14 290)" />
          <stop offset="100%" stopColor="oklch(0.60 0.17 290)" />
        </radialGradient>

        {/* Glow effect for center spark */}
        <filter id="spark-glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export function SparkCircleHorizontal({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="spark-h-title"
    >
      <title id="spark-h-title">Xersha Logo</title>

      {/* Logo mark */}
      <g>
        <circle cx="24" cy="24" r="18" stroke="url(#sh-ring)" strokeWidth="1.5" fill="none" opacity="0.4" />

        {/* Connection lines */}
        <line x1="24" y1="6" x2="39.2" y2="30" stroke="url(#sh-l1)" strokeWidth="1" opacity="0.3" />
        <line x1="24" y1="6" x2="8.8" y2="30" stroke="url(#sh-l2)" strokeWidth="1" opacity="0.3" />
        <line x1="39.2" y1="30" x2="6" y2="24" stroke="url(#sh-l3)" strokeWidth="1" opacity="0.3" />
        <line x1="8.8" y1="30" x2="42" y2="24" stroke="url(#sh-l4)" strokeWidth="1" opacity="0.3" />
        <line x1="6" y1="24" x2="39.2" y2="30" stroke="url(#sh-l5)" strokeWidth="1" opacity="0.3" />
        <line x1="42" y1="24" x2="8.8" y2="30" stroke="url(#sh-l6)" strokeWidth="1" opacity="0.3" />

        {/* Central spark */}
        <g filter="url(#sh-glow)">
          <path d="M24 18 L25 22 L29 22 L26 25 L27 29 L24 27 L21 29 L22 25 L19 22 L23 22 Z" fill="url(#sh-center)" />
          <circle cx="24" cy="24" r="3" fill="url(#sh-core)" />
        </g>

        {/* Nodes */}
        <circle cx="24" cy="6" r="3.5" fill="url(#sh-n1)" stroke="oklch(0.85 0.14 45)" strokeWidth="1.5" />
        <circle cx="42" cy="24" r="3.5" fill="url(#sh-n2)" stroke="oklch(0.75 0.16 60)" strokeWidth="1.5" />
        <circle cx="39.2" cy="30" r="3" fill="url(#sh-n3)" stroke="oklch(0.70 0.16 200)" strokeWidth="1.5" />
        <circle cx="8.8" cy="30" r="3" fill="url(#sh-n4)" stroke="oklch(0.68 0.17 270)" strokeWidth="1.5" />
        <circle cx="6" cy="24" r="3.5" fill="url(#sh-n5)" stroke="oklch(0.65 0.17 290)" strokeWidth="1.5" />

        {/* Accent sparkles */}
        <circle cx="18" cy="10" r="1" fill="oklch(0.80 0.14 45)" opacity="0.8" />
        <circle cx="30" cy="10" r="1.2" fill="oklch(0.75 0.16 60)" opacity="0.9" />
        <circle cx="38" cy="18" r="0.8" fill="oklch(0.70 0.16 200)" opacity="0.7" />
        <circle cx="38" cy="30" r="1" fill="oklch(0.68 0.17 270)" opacity="0.8" />
        <circle cx="10" cy="30" r="1.2" fill="oklch(0.65 0.17 290)" opacity="0.9" />
        <circle cx="10" cy="18" r="0.8" fill="oklch(0.75 0.16 45)" opacity="0.7" />
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
        <radialGradient id="sh-core">
          <stop offset="0%" stopColor="oklch(0.95 0.12 45)" />
          <stop offset="50%" stopColor="oklch(0.75 0.17 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>
        <linearGradient id="sh-center" x1="24" y1="18" x2="24" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.85 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 60)" />
        </linearGradient>
        <linearGradient id="sh-ring" x1="6" y1="24" x2="42" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="0.33" stopColor="oklch(0.70 0.16 167)" />
          <stop offset="0.66" stopColor="oklch(0.65 0.17 290)" />
          <stop offset="1" stopColor="oklch(0.75 0.15 45)" />
        </linearGradient>
        <linearGradient id="sh-l1" x1="24" y1="6" x2="39.2" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 200)" />
        </linearGradient>
        <linearGradient id="sh-l2" x1="24" y1="6" x2="8.8" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="1" stopColor="oklch(0.68 0.17 270)" />
        </linearGradient>
        <linearGradient id="sh-l3" x1="39.2" y1="30" x2="6" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.70 0.16 200)" />
          <stop offset="1" stopColor="oklch(0.65 0.17 290)" />
        </linearGradient>
        <linearGradient id="sh-l4" x1="8.8" y1="30" x2="42" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.68 0.17 270)" />
          <stop offset="1" stopColor="oklch(0.75 0.16 60)" />
        </linearGradient>
        <linearGradient id="sh-l5" x1="6" y1="24" x2="39.2" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.65 0.17 290)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 200)" />
        </linearGradient>
        <linearGradient id="sh-l6" x1="42" y1="24" x2="8.8" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.16 60)" />
          <stop offset="1" stopColor="oklch(0.68 0.17 270)" />
        </linearGradient>
        <radialGradient id="sh-n1">
          <stop offset="0%" stopColor="oklch(0.95 0.10 45)" />
          <stop offset="100%" stopColor="oklch(0.75 0.15 45)" />
        </radialGradient>
        <radialGradient id="sh-n2">
          <stop offset="0%" stopColor="oklch(0.92 0.12 60)" />
          <stop offset="100%" stopColor="oklch(0.72 0.16 60)" />
        </radialGradient>
        <radialGradient id="sh-n3">
          <stop offset="0%" stopColor="oklch(0.88 0.13 167)" />
          <stop offset="100%" stopColor="oklch(0.68 0.16 167)" />
        </radialGradient>
        <radialGradient id="sh-n4">
          <stop offset="0%" stopColor="oklch(0.85 0.14 270)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 270)" />
        </radialGradient>
        <radialGradient id="sh-n5">
          <stop offset="0%" stopColor="oklch(0.85 0.14 290)" />
          <stop offset="100%" stopColor="oklch(0.60 0.17 290)" />
        </radialGradient>
        <filter id="sh-glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export function SparkCircleFull({ className, size = 48 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 160 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto", className)}
      style={{ height: size }}
      role="img"
      aria-labelledby="spark-f-title"
    >
      <title id="spark-f-title">Xersha - Save Together</title>

      {/* Logo mark */}
      <g transform="translate(0, 8)">
        <circle cx="24" cy="24" r="18" stroke="url(#sf-ring)" strokeWidth="1.5" fill="none" opacity="0.4" />

        {/* Connection lines */}
        <line x1="24" y1="6" x2="39.2" y2="30" stroke="url(#sf-l1)" strokeWidth="1" opacity="0.3" />
        <line x1="24" y1="6" x2="8.8" y2="30" stroke="url(#sf-l2)" strokeWidth="1" opacity="0.3" />
        <line x1="39.2" y1="30" x2="6" y2="24" stroke="url(#sf-l3)" strokeWidth="1" opacity="0.3" />
        <line x1="8.8" y1="30" x2="42" y2="24" stroke="url(#sf-l4)" strokeWidth="1" opacity="0.3" />
        <line x1="6" y1="24" x2="39.2" y2="30" stroke="url(#sf-l5)" strokeWidth="1" opacity="0.3" />
        <line x1="42" y1="24" x2="8.8" y2="30" stroke="url(#sf-l6)" strokeWidth="1" opacity="0.3" />

        {/* Central spark */}
        <g filter="url(#sf-glow)">
          <path d="M24 18 L25 22 L29 22 L26 25 L27 29 L24 27 L21 29 L22 25 L19 22 L23 22 Z" fill="url(#sf-center)" />
          <circle cx="24" cy="24" r="3" fill="url(#sf-core)" />
        </g>

        {/* Nodes */}
        <circle cx="24" cy="6" r="3.5" fill="url(#sf-n1)" stroke="oklch(0.85 0.14 45)" strokeWidth="1.5" />
        <circle cx="42" cy="24" r="3.5" fill="url(#sf-n2)" stroke="oklch(0.75 0.16 60)" strokeWidth="1.5" />
        <circle cx="39.2" cy="30" r="3" fill="url(#sf-n3)" stroke="oklch(0.70 0.16 200)" strokeWidth="1.5" />
        <circle cx="8.8" cy="30" r="3" fill="url(#sf-n4)" stroke="oklch(0.68 0.17 270)" strokeWidth="1.5" />
        <circle cx="6" cy="24" r="3.5" fill="url(#sf-n5)" stroke="oklch(0.65 0.17 290)" strokeWidth="1.5" />

        {/* Accent sparkles */}
        <circle cx="18" cy="10" r="1" fill="oklch(0.80 0.14 45)" opacity="0.8" />
        <circle cx="30" cy="10" r="1.2" fill="oklch(0.75 0.16 60)" opacity="0.9" />
        <circle cx="38" cy="18" r="0.8" fill="oklch(0.70 0.16 200)" opacity="0.7" />
        <circle cx="38" cy="30" r="1" fill="oklch(0.68 0.17 270)" opacity="0.8" />
        <circle cx="10" cy="30" r="1.2" fill="oklch(0.65 0.17 290)" opacity="0.9" />
        <circle cx="10" cy="18" r="0.8" fill="oklch(0.75 0.16 45)" opacity="0.7" />
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
        <radialGradient id="sf-core">
          <stop offset="0%" stopColor="oklch(0.95 0.12 45)" />
          <stop offset="50%" stopColor="oklch(0.75 0.17 45)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 45)" />
        </radialGradient>
        <linearGradient id="sf-center" x1="24" y1="18" x2="24" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.85 0.14 45)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 60)" />
        </linearGradient>
        <linearGradient id="sf-ring" x1="6" y1="24" x2="42" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="0.33" stopColor="oklch(0.70 0.16 167)" />
          <stop offset="0.66" stopColor="oklch(0.65 0.17 290)" />
          <stop offset="1" stopColor="oklch(0.75 0.15 45)" />
        </linearGradient>
        <linearGradient id="sf-l1" x1="24" y1="6" x2="39.2" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 200)" />
        </linearGradient>
        <linearGradient id="sf-l2" x1="24" y1="6" x2="8.8" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.15 45)" />
          <stop offset="1" stopColor="oklch(0.68 0.17 270)" />
        </linearGradient>
        <linearGradient id="sf-l3" x1="39.2" y1="30" x2="6" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.70 0.16 200)" />
          <stop offset="1" stopColor="oklch(0.65 0.17 290)" />
        </linearGradient>
        <linearGradient id="sf-l4" x1="8.8" y1="30" x2="42" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.68 0.17 270)" />
          <stop offset="1" stopColor="oklch(0.75 0.16 60)" />
        </linearGradient>
        <linearGradient id="sf-l5" x1="6" y1="24" x2="39.2" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.65 0.17 290)" />
          <stop offset="1" stopColor="oklch(0.70 0.16 200)" />
        </linearGradient>
        <linearGradient id="sf-l6" x1="42" y1="24" x2="8.8" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.75 0.16 60)" />
          <stop offset="1" stopColor="oklch(0.68 0.17 270)" />
        </linearGradient>
        <radialGradient id="sf-n1">
          <stop offset="0%" stopColor="oklch(0.95 0.10 45)" />
          <stop offset="100%" stopColor="oklch(0.75 0.15 45)" />
        </radialGradient>
        <radialGradient id="sf-n2">
          <stop offset="0%" stopColor="oklch(0.92 0.12 60)" />
          <stop offset="100%" stopColor="oklch(0.72 0.16 60)" />
        </radialGradient>
        <radialGradient id="sf-n3">
          <stop offset="0%" stopColor="oklch(0.88 0.13 167)" />
          <stop offset="100%" stopColor="oklch(0.68 0.16 167)" />
        </radialGradient>
        <radialGradient id="sf-n4">
          <stop offset="0%" stopColor="oklch(0.85 0.14 270)" />
          <stop offset="100%" stopColor="oklch(0.65 0.17 270)" />
        </radialGradient>
        <radialGradient id="sf-n5">
          <stop offset="0%" stopColor="oklch(0.85 0.14 290)" />
          <stop offset="100%" stopColor="oklch(0.60 0.17 290)" />
        </radialGradient>
        <filter id="sf-glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export const SparkCircleInfo = {
  name: "Spark Circle",
  concept: "The moment of collective ignition",
  description: "A radiant constellation where friends converge to create something extraordinary. Five nodes representing community members connect through sacred geometry, forming a protective circle around a brilliant central spark - the moment when individual efforts combine to create unstoppable momentum. The design blends network theory with the golden ratio, while subtle sparkles suggest the magic and excitement of collective achievement. At small sizes, it's a recognizable constellation; at large sizes, the intricate connections reveal themselves.",
  strengths: [
    "Bold and instantly memorable - 'WOW' factor",
    "Unique sacred geometry and constellation aesthetic",
    "Rich symbolism: unity, connection, spark of collaboration",
    "Works beautifully at 16px (clear structure) and scales with increasing detail",
    "Dynamic energy through sparkles and glowing center",
    "Perfect balance of mathematical precision and human warmth",
    "Network effect visualization - shows power of connection"
  ],
  colors: [
    "oklch(0.65 0.17 45) Orange",
    "oklch(0.60 0.17 290) Purple",
    "Radial gradients",
    "Multi-hue spectrum transition"
  ]
};
