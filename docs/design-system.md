# Xersha Design System

## Overview

Xersha's design system is built to be social, friendly, and trustworthy—making DeFi accessible to Gen Z and millennials who want to save money together. The design is inspired by Citrea's vibrant orange brand while maintaining professional financial app standards.

## Color Palette

### Primary Colors (Orange Spectrum)

Our primary color is inspired by Citrea, creating warmth, energy, and approachability.

- **primary-50** - `oklch(0.97 0.01 45)` - Lightest tint (backgrounds)
- **primary-100** - `oklch(0.94 0.03 45)` - Very light (hover states)
- **primary-200** - `oklch(0.88 0.06 45)` - Light (subtle highlights)
- **primary-300** - `oklch(0.80 0.10 45)` - Light medium
- **primary-400** - `oklch(0.72 0.14 45)` - Medium light
- **primary-500** - `oklch(0.65 0.17 45)` - **Main brand orange** ⭐
- **primary-600** - `oklch(0.58 0.16 45)` - Medium dark (primary buttons)
- **primary-700** - `oklch(0.48 0.14 45)` - Dark (hover states)
- **primary-800** - `oklch(0.40 0.12 45)` - Very dark (active states)
- **primary-900** - `oklch(0.32 0.10 45)` - Darkest
- **primary-950** - `oklch(0.24 0.08 45)` - Extra dark

**Usage:**
- Primary CTAs (buttons, links)
- Brand elements
- Interactive highlights
- Focus states

### Secondary Colors (Purple/Violet)

Purple adds sophistication, trust, and creates beautiful visual hierarchy alongside orange.

- **secondary-50** through **secondary-950** - Purple spectrum
- **secondary-500** - `oklch(0.60 0.17 290)` - Main secondary color
- **secondary-600** - `oklch(0.52 0.16 290)` - Used for secondary buttons

**Usage:**
- Secondary actions
- Accent elements
- Alternative call-to-actions
- Decorative elements

### Neutral Colors (Warm Grays)

Slightly warm-toned neutrals complement the orange primary color while maintaining professionalism.

- **neutral-50** - `oklch(0.98 0.002 45)` - Background
- **neutral-100** through **neutral-900** - Full gray spectrum
- **neutral-900** - `oklch(0.18 0.003 45)` - Primary text
- **neutral-600** - `oklch(0.45 0.006 45)` - Secondary text

**Usage:**
- Text hierarchy
- Backgrounds
- Borders
- Disabled states

### Semantic Colors

#### Success (Teal-Green)
- **success-500** - `oklch(0.60 0.16 160)` - Success messages, confirmations
- Used for: Positive feedback, completed actions, verified states

#### Warning (Amber)
- **warning-500** - `oklch(0.68 0.17 85)` - Warnings, cautions
- Used for: Important notices, pending actions

#### Error (Warm Red)
- **error-500** - `oklch(0.60 0.18 25)` - Errors, destructive actions
- Used for: Validation errors, destructive confirmations

#### Info (Blue)
- **info-500** - `oklch(0.60 0.17 240)` - Informational messages
- Used for: Tips, helper text, neutral notifications

## Accessibility

All color combinations meet **WCAG 2.1 Level AA** standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Interactive elements: 3:1 minimum contrast ratio

## Typography

### Font Family
- **Primary**: Inter (sans-serif)
- **Fallback**: system-ui, sans-serif

### Font Sizes
- `xs` - 12px (0.75rem) - Captions, small labels
- `sm` - 14px (0.875rem) - Secondary text
- `base` - 16px (1rem) - Body text
- `lg` - 18px (1.125rem) - Emphasized text
- `xl` - 20px (1.25rem) - Small headings
- `2xl` - 24px (1.5rem) - Section headings
- `3xl` - 30px (1.875rem) - Page headings
- `4xl` - 36px (2.25rem) - Hero text
- `5xl` - 48px (3rem) - Display text

### Font Weights
- `normal` - 400 - Body text
- `medium` - 500 - Emphasized text
- `semibold` - 600 - Subheadings
- `bold` - 700 - Headings

## Spacing

Based on an 8px grid system:
- `1` - 4px
- `2` - 8px
- `3` - 12px
- `4` - 16px
- `6` - 24px
- `8` - 32px
- `12` - 48px
- `16` - 64px

## Border Radius

- `sm` - 4px - Small elements
- `DEFAULT` - 8px - Standard elements
- `md` - 12px - Cards, inputs
- `lg` - 16px - Large cards
- `xl` - 24px - Hero elements
- `2xl` - 32px - Extra large elements
- `full` - 9999px - Pills, circular elements

## Shadows

Progressive shadow system for depth:
- `sm` - Subtle elevation
- `DEFAULT` - Standard elevation
- `md` - Medium elevation (cards)
- `lg` - High elevation (modals)
- `xl` - Very high elevation (tooltips)
- `2xl` - Maximum elevation (dropdowns)

## Components

### Buttons

**Variants:**
- `default` - Primary orange button (primary-600)
- `outline` - Outlined button with primary border
- `secondary` - Purple secondary button (secondary-600)
- `ghost` - Transparent button with hover state
- `link` - Text link button
- `destructive` - Red error button (error-500)

**Sizes:**
- `sm` - 36px height - Compact interfaces
- `default` - 40px height - Standard buttons
- `lg` - 48px height - Prominent actions

**Usage Guidelines:**
- Use `default` for primary actions
- Use `outline` for secondary actions on colored backgrounds
- Use `secondary` for alternative important actions
- Use `ghost` for tertiary actions
- Use `destructive` for deletion/dangerous actions

### Cards

White cards with subtle shadows, used for:
- Login/signup forms
- Savings circle information
- Transaction history
- User profiles

## Usage Guidelines

### Color Usage Principles

1. **Primary (Orange)** should dominate the UI:
   - Main CTAs
   - Interactive elements
   - Brand touchpoints
   - Navigation active states

2. **Secondary (Purple)** should be used sparingly:
   - Alternative important actions
   - Accent elements
   - Visual variety in illustrations

3. **Neutrals** provide structure:
   - Text hierarchy
   - Backgrounds and surfaces
   - Borders and dividers

4. **Semantics** communicate status:
   - Only use for their specific purpose
   - Never use for decoration
   - Ensure accessibility

### Best Practices

1. **Consistency**: Use the same color for the same purpose across the app
2. **Hierarchy**: Use color to guide user attention to important elements
3. **Accessibility**: Always test contrast ratios
4. **Trust**: Maintain professional appearance with proper color balance
5. **Social**: Keep the interface warm and friendly with primary colors

## Implementation

All colors are defined in `app/app.css` using Tailwind CSS v4's `@theme` directive with OKLCH color space for:
- Perceptually uniform colors
- Better gradients
- Wide color gamut support
- Future-proof color management

### Using Colors in Code

```tsx
// Backgrounds
<div className="bg-primary-600">Primary button background</div>
<div className="bg-neutral-50">Page background</div>

// Text
<p className="text-neutral-900">Primary text</p>
<p className="text-neutral-600">Secondary text</p>

// Borders
<div className="border-2 border-primary-600">Outlined element</div>

// Hover states
<button className="bg-primary-600 hover:bg-primary-700">
  Hover me
</button>
```

## Brand Voice

Our design should communicate:
- **Friendly**: Warm colors, rounded corners, approachable language
- **Trustworthy**: Professional spacing, clear hierarchy, secure indicators
- **Social**: Community-focused icons, group-oriented layouts
- **Modern**: Clean design, contemporary components, smooth animations
- **Accessible**: High contrast, clear labels, keyboard navigation

## Resources

- Figma file: [Coming soon]
- Component library: Built with shadcn/ui
- Icons: lucide-react
- Authentication: Dynamic.xyz
- Blockchain: Citrea testnet
