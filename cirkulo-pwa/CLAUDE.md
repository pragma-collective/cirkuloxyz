# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cirkulo (Xersha)** is a Bitcoin-powered social savings PWA where friends can create "circles" to save money together for shared goals. Built with React Router 7 in SPA mode, it emphasizes social-first UX while leveraging Bitcoin technology for transparency and security.

**Key Technologies:**
- React Router 7 (SPA mode, no SSR)
- TypeScript
- Tailwind CSS v4 (using `@theme` directive)
- OKLCH color space for design system
- Lucide React icons
- shadcn/ui component patterns

## Development Commands

```bash
# Start development server (HMR enabled)
pnpm dev
# Available at http://localhost:5173

# Type checking
pnpm typecheck

# Production build
pnpm build

# Start production server locally
pnpm start
```

## Docker Deployment

```bash
# Build Docker image with environment variable
docker build --build-arg VITE_DYNAMIC_ENVIRONMENT_ID=your_id -t cirkulo-pwa .

# Run container
docker run -p 3000:3000 cirkulo-pwa
```

The app uses Caddy for production serving with SPA fallback routing.

## Architecture

### SPA Configuration
- `react-router.config.ts`: Configured with `ssr: false` for client-side only PWA
- All rendering happens in the browser
- Routes defined in `app/routes.ts` using React Router 7's file-based routing

### Route Structure
Routes are explicitly defined in `app/routes.ts`:
- `/` → `routes/home.tsx` (landing page)
- `/login` → `routes/login.tsx`
- `/logo-showcase` → `routes/logo-showcase.tsx` (design system showcase)

To add new routes, register them in `app/routes.ts` using `route()` or `index()` functions.

### Component Organization

**Landing Page** (`routes/home.tsx`):
Composed of modular sections imported in order:
1. `Navigation` - Header with logo and auth CTA
2. `HeroSection` - Main headline with Bitcoin badge
3. `HowItWorks` - 3-step process
4. `UseCases` - 6 relatable savings scenarios
5. `FeaturesSection` - Social feed, automation, celebrations
6. `CryptoValueSection` - Bitcoin value proposition (transparency, control, flexibility)
7. `SocialFeedShowcase` - Visual mockup
8. `TrustSection` - 5 security/trust items including Bitcoin security
9. `Testimonials` - Social proof
10. `FinalCTA` - Conversion section
11. `Footer` - Links including "Why Bitcoin?"

Each section is self-contained in `app/components/landing/`.

**Logo System**:
- Active logo: `app/components/xersha-logo.tsx` (currently Momentum Wave)
- 6 logo concepts in `app/components/logos/`:
  - `momentum-wave.tsx` (current)
  - `spark-circle.tsx`
  - `cosmic-unity.tsx`
  - `golden-abundance.tsx`
  - `unity-circles.tsx`
  - `connected-x.tsx`
- Each logo has 3 variants: Icon, Horizontal, Full
- Logo comparison docs in `docs/design/LOGO-COMPARISON.md`

### Design System

**OKLCH Color Space** (`app/app.css`):
- Primary: Orange (#ea7c3f, hue 45°) - Citrea-inspired brand color
- Secondary: Purple (hue 290°) - Accent color
- Semantic colors: success (teal-green), warning (amber), error (red), info (blue)
- All colors use OKLCH for perceptual uniformity and better gradients
- WCAG AA compliant (4.5:1 contrast minimum)

**Component Patterns**:
- Uses shadcn/ui patterns with `cn()` utility from `app/lib/utils.ts`
- `cn()` combines clsx and tailwind-merge for clean class composition
- UI components in `app/components/ui/` (Button, Card)

### Crypto Messaging Strategy

The app transparently communicates Bitcoin usage while maintaining a friendly, social-first tone:

1. **Progressive Disclosure**:
   - Hero badge: "Powered by Bitcoin for transparent savings"
   - Dedicated section mid-page explaining benefits
   - Trust section includes Bitcoin security
   - Footer has "Why Bitcoin?" educational link

2. **Copy Approach**:
   - Benefits-first, technology-second
   - Plain language (no "blockchain", "DeFi", "hodl")
   - "Digital dollars" = stablecoins
   - Emphasize transparency, control, asset flexibility

3. **Visual Style**:
   - Abstract geometric patterns (no Bitcoin logos or coins)
   - Warm gold accents (warning color palette)
   - Flowing gradients aligned with Momentum Wave logo concept

### PWA Configuration

**Manifest** (`public/manifest.json`):
- App name: "Xersha - Save Together"
- Theme color: `#ea7c3f` (brand orange)
- Display: standalone (full-screen app)
- Icons: 16x16, 32x32, 180x180, 192x192, 512x512

**Favicons**:
- `public/favicon.svg` - Modern SVG version (primary)
- PNG fallbacks for all sizes
- All generated from Momentum Wave logo

**Meta Tags** (`app/root.tsx`):
- Apple mobile web app capable
- Theme color set for iOS/Android
- Viewport configured for mobile-first

### Styling Conventions

1. **Light Mode Only**: `<html className="light">` enforced in root
2. **Mobile-First**: All responsive classes use sm:, md:, lg: breakpoints
3. **Gradients**: Use `from-primary-X to-secondary-X` for brand consistency
4. **Spacing**: Consistent py-20 md:py-32 for section padding
5. **Rounded Corners**: `rounded-3xl` for cards, `rounded-full` for badges/avatars
6. **Shadows**: `shadow-xl` and `shadow-2xl` for depth

## Important Patterns

### Async Logic and Hooks Pattern

**Key Principle**: Keep components clean by extracting async logic into custom hooks in `app/hooks/`.

**Pattern Structure:**
1. **Create hook files in `app/hooks/`** - Encapsulate all async operations
2. **Export standalone functions** - For operations that need to be called independently
3. **Export custom hooks** - For component-level state management
4. **Keep components presentational** - Routes/components should focus on UI rendering

**Example: Lens Account Creation** (`app/hooks/create-lens-account.ts`)

```typescript
// 1. Export standalone async functions for early execution
export async function authenticateAsOnboardingUser(
  walletAddress: string,
  appAddress: string,
  walletClient: WalletClient
): Promise<AuthenticationResult> {
  // Async authentication logic
  // Can be called independently (e.g., on page load)
}

export async function checkUsername(
  username: string,
  sessionClient: SessionClient
): Promise<UsernameAvailability> {
  // Username validation logic
  // Can be called independently (e.g., on blur)
}

// 2. Export custom hook for component-level operations
export function useCreateLensAccount() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAccount = useCallback(async (params) => {
    // Uses standalone functions internally
    // Manages loading/error state for UI feedback
  }, []);

  return { createAccount, isCreating, error };
}
```

**Component Usage** (`app/routes/onboarding.tsx`):

```typescript
// Import standalone functions + custom hook
import {
  authenticateAsOnboardingUser,
  checkUsername,
  useCreateLensAccount,
} from "app/hooks/create-lens-account";

function Onboarding() {
  const { createAccount, isCreating } = useCreateLensAccount();
  const [sessionClient, setSessionClient] = useState(null);

  // Early authentication on mount
  useEffect(() => {
    const auth = async () => {
      const result = await authenticateAsOnboardingUser(
        walletAddress,
        appAddress,
        walletClient
      );
      setSessionClient(result.sessionClient);
    };
    auth();
  }, [walletAddress]);

  // Real-time validation on blur
  const handleBlur = async (username: string) => {
    const availability = await checkUsername(username, sessionClient);
    // Update UI based on availability
  };

  // Form submission using hook
  const handleSubmit = async () => {
    const result = await createAccount({
      username,
      metadataUri,
      walletAddress,
      appAddress,
      sessionClient, // Reuse from earlier auth
    });
  };
}
```

**Benefits:**
- **Separation of Concerns**: Business logic separated from presentation
- **Reusability**: Functions can be used across multiple components
- **Testability**: Easier to unit test isolated functions
- **Maintainability**: Changes to async logic don't affect component structure
- **Performance**: Enables optimization patterns (early auth, session reuse)

**When to Use This Pattern:**
- Complex async operations (API calls, blockchain transactions, authentication)
- Logic that needs to be reused across multiple components
- Operations requiring state management (loading states, errors)
- Early execution patterns (auth on mount, background prefetching)
- Real-time validation (username checks, form validation)

**Hooks Location:**
- `app/hooks/create-lens-account.ts` - Lens account creation and authentication
- `app/hooks/fetch-lens-accounts.ts` - Fetching existing Lens accounts
- Follow this pattern for new async operations

### Form Management Pattern

**Key Principle**: Use react-hook-form + zod for all forms to ensure type safety and reduce boilerplate.

**Pattern Structure:**
1. **Create Zod schemas in `app/schemas/`** - Define validation rules and infer TypeScript types
2. **Use react-hook-form in components** - Integrate with zodResolver for automatic validation
3. **Support async validation** - Use `setError` for server-side validation (e.g., username availability)
4. **Keep forms controlled** - Let react-hook-form manage state, avoid manual state management

**Example: Onboarding Form** (`app/routes/onboarding.tsx` + `app/schemas/onboarding-schema.ts`)

**Step 1: Create Zod Schema** (`app/schemas/onboarding-schema.ts`):
```typescript
import { z } from "zod";

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s-]+$/, "Name can only contain letters, spaces, and hyphens"),

  lensUsername: z
    .string()
    .min(1, "Lens username is required")
    .min(3, "Username must be at least 3 characters")
    .max(26, "Username must be no more than 26 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),

  bio: z.string().max(280, "Bio must be no more than 280 characters").optional(),

  profilePhoto: z.instanceof(File).nullable().optional(),
});

// Infer TypeScript type from schema
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
```

**Step 2: Use react-hook-form in Component** (`app/routes/onboarding.tsx`):
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingFormData } from "app/schemas/onboarding-schema";

function Onboarding() {
  // Setup react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      lensUsername: "",
      bio: "",
      profilePhoto: null,
    },
  });

  // Watch fields for UI updates (e.g., character count)
  const bioValue = watch("bio") || "";

  // Async validation example (username availability)
  const handleUsernameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const username = e.target.value;

    if (!username.trim() || errors.lensUsername) return;

    const availability = await checkUsername(username);

    if (!availability.available) {
      setError("lensUsername", {
        type: "manual",
        message: availability.reason || "Username is not available",
      });
    }
  };

  // Form submission handler
  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const result = await createAccount({
        username: data.lensUsername,
        // ... other fields
      });

      if (result.error) {
        setError("lensUsername", {
          type: "manual",
          message: result.error.message,
        });
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      setError("lensUsername", {
        type: "manual",
        message: error instanceof Error ? error.message : "Failed to create account",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields use register() for automatic binding */}
      <FormField
        label="Name"
        type="text"
        error={errors.name?.message}
        {...register("name")}
      />

      <FormField
        label="Username"
        type="text"
        error={errors.lensUsername?.message}
        onBlurCapture={handleUsernameBlur}
        {...register("lensUsername")}
      />

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

**Step 3: Create Form Field Component with ref forwarding**:
```typescript
import React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  // ... other props
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, ...rest }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...rest} />
        {error && <p>{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
```

**Benefits:**
- **Type Safety**: Zod schemas provide runtime validation + TypeScript types
- **Less Boilerplate**: No manual state management for form values
- **Automatic Validation**: Zod schema validates on submit/blur/change
- **Async Validation**: Use `setError` for server-side checks
- **Performance**: Only re-renders changed fields
- **Consistent Pattern**: All forms follow same structure

**When to Use:**
- All forms with 2+ fields
- Forms requiring validation
- Forms with async operations (API calls, file uploads)
- Forms that need to track touched/dirty state

**Schema Location:**
- `app/schemas/onboarding-schema.ts` - User onboarding form
- `app/schemas/circle-schema.ts` - Create/edit circle form (future)
- Follow `{feature}-schema.ts` naming convention

### Adding New Landing Sections

1. Create component in `app/components/landing/section-name.tsx`
2. Import and add to `routes/home.tsx` in appropriate order
3. Follow existing section structure:
   - Outer `<section>` with padding and background
   - Max-width container (max-w-7xl mx-auto)
   - Centered header with h2 and subtext
   - Grid or flex content area
   - Consider decorative background blobs for visual interest

### Color Usage Guidelines

- **Primary (orange)**: Main CTAs, brand elements, links
- **Secondary (purple)**: Accents, secondary actions, gradients
- **Success (teal)**: Positive feedback, checkmarks, trust signals
- **Warning (gold)**: Bitcoin-related badges, "powered by" elements
- **Neutral**: Text, backgrounds, borders

### Icon Usage

All icons from Lucide React. Common patterns:
- `className="size-5"` for inline icons (20px)
- `className="size-7"` for feature icons (28px)
- `className="size-10"` for large hero icons (40px)
- `strokeWidth={2}` for consistent weight

## File Naming

- Components: `kebab-case.tsx` (e.g., `hero-section.tsx`)
- Routes: `kebab-case.tsx` (e.g., `logo-showcase.tsx`)
- Types: PascalCase for interfaces/types
- Utilities: `camelCase` for functions

## Environment Variables

- `VITE_DYNAMIC_ENVIRONMENT_ID`: Dynamic.xyz authentication environment ID
- `VITE_LENS_APP_ADDRESS`: Lens Protocol app address for account creation
- Set in Docker build args or local `.env` file

## Logo Switching

To change the active logo:
1. Open `app/components/xersha-logo.tsx`
2. Replace SVG content with desired logo from `app/components/logos/`
3. Update viewBox and gradient IDs if needed
4. Current logo: Momentum Wave (3 ascending waves with accent dots)

## Design Documentation

- `docs/design/LOGO-COMPARISON.md`: Comprehensive comparison of 6 logo finalists
- Logo showcase available at `/logo-showcase` route for visual comparison
- Design rationale emphasizes social-first, Bitcoin-transparent approach
