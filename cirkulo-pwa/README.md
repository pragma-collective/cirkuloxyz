# Cirkulo (Xersha)

A Bitcoin-powered social savings PWA where friends create "circles" to save money together for shared goals. Built with React Router 7 in SPA mode, emphasizing social-first UX with Bitcoin technology for transparency and security.

## Features

- 💰 **Bitcoin-Powered**: Transparent savings backed by Bitcoin technology
- 👥 **Social Circles**: Save together with friends for shared goals
- 🎯 **Goal Tracking**: Visual progress tracking and milestones
- 📱 **Progressive Web App**: Full offline support, installable on any device
- 🔐 **Lens Protocol**: Decentralized social identity and connections
- 🎨 **Modern Stack**: React Router 7 (SPA mode), TypeScript, Tailwind CSS v4

## Tech Stack

- **Frontend**: React 19, React Router 7 (SPA mode, no SSR)
- **Styling**: Tailwind CSS v4 with OKLCH color space
- **Forms**: react-hook-form + Zod for type-safe validation
- **Blockchain**: Lens Protocol, Dynamic.xyz wallet integration
- **Icons**: Lucide React
- **Type Safety**: TypeScript with strict mode

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Dynamic.xyz account for wallet integration ([get one here](https://dynamic.xyz))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cirkulo-pwa
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file:
```bash
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
VITE_LENS_APP_ADDRESS=your_lens_protocol_app_address
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

### Type Checking

Run TypeScript type checking:

```bash
pnpm typecheck
```

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

### Docker Deployment

Build with environment variables:

```bash
docker build \
  --build-arg VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_id \
  --build-arg VITE_LENS_APP_ADDRESS=your_lens_app_address \
  -t cirkulo-pwa .

# Run the container
docker run -p 3000:3000 cirkulo-pwa
```

The app uses Caddy for production serving with SPA fallback routing.

Deployment platforms:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Production Build

```bash
pnpm build
pnpm start  # Start production server locally
```

## Project Structure

```
cirkulo-pwa/
├── app/
│   ├── routes/           # Route components (home, onboarding, etc.)
│   ├── components/       # React components
│   │   ├── landing/      # Landing page sections
│   │   ├── logos/        # Logo variants
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   │   ├── create-lens-account.ts    # Lens account creation
│   │   └── fetch-lens-accounts.ts    # Fetch Lens accounts
│   ├── schemas/          # Zod validation schemas
│   │   └── onboarding-schema.ts      # Onboarding form validation
│   ├── context/          # React context providers
│   ├── lib/              # Utility functions
│   └── app.css           # Global styles (Tailwind + OKLCH colors)
├── public/               # Static assets
├── docs/                 # Documentation
│   └── design/           # Design documentation
├── CLAUDE.md            # Development patterns and guidelines
└── README.md            # This file
```

## Development Patterns

### Form Management

All forms use **react-hook-form + Zod** for type-safe validation:

```typescript
// 1. Define schema in app/schemas/
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export type FormData = z.infer<typeof formSchema>;

// 2. Use in component
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(formSchema),
});
```

**Benefits**: Type safety, automatic validation, less boilerplate, async validation support

### Async Logic

Extract async operations into **custom hooks** in `app/hooks/`:

```typescript
// app/hooks/my-feature.ts
export async function myAsyncOperation() {
  // Standalone function for flexibility
}

export function useMyFeature() {
  const [isLoading, setIsLoading] = useState(false);

  const doSomething = useCallback(async () => {
    // Hook for component-level state management
  }, []);

  return { doSomething, isLoading };
}
```

**Benefits**: Separation of concerns, reusability, testability, performance optimization

### Styling

- **Design System**: OKLCH color space for perceptual uniformity
- **Colors**: Primary (orange #ea7c3f), Secondary (purple), Semantic (success/warning/error/info)
- **Mobile-First**: All responsive classes use sm:, md:, lg: breakpoints
- **Components**: shadcn/ui patterns with `cn()` utility

## Key Dependencies

- `react-hook-form` - Form state management
- `zod` - Schema validation and type inference
- `@lens-protocol/client` - Lens Protocol integration
- `@dynamic-labs/sdk-react-core` - Wallet connection
- `lucide-react` - Icon library
- `tailwindcss` - Utility-first CSS

## Documentation

- **CLAUDE.md**: Comprehensive development guidelines, patterns, and examples
- **docs/design/**: Design decisions and logo comparisons

## Contributing

See [CLAUDE.md](./CLAUDE.md) for detailed development patterns and guidelines.

---

Built with ❤️ using React Router, Lens Protocol, and Bitcoin technology.
