# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cirkulo (Xersha)** is a Bitcoin-powered social savings platform built on Citrea (Bitcoin's first ZK Rollup). Users create "circles" with friends to save money together for shared goals, combining social accountability with transparent on-chain tracking.

This is a **monorepo** containing three interconnected packages:
- **cirkulo-pwa**: React Router 7 Progressive Web App (frontend)
- **cirkulo-api**: Hono.js REST API with PostgreSQL (backend)
- **cirkulo-contracts**: Scaffold-ETH 2 smart contracts on Citrea (blockchain)

**Tech Stack Highlights:**
- Frontend: React Router 7 (SPA mode), TypeScript, Tailwind CSS v4, Lens Protocol SDK
- Backend: Hono, Drizzle ORM, PostgreSQL, Bun runtime
- Blockchain: Solidity (Hardhat), Citrea testnet, EVM-compatible
- Authentication: Dynamic.xyz (wallet), Lens Protocol (social accounts)

## Monorepo Structure

```
cirkulo/
├── cirkulo-pwa/              # Progressive Web App
│   ├── app/
│   │   ├── routes/           # Page routes (React Router 7)
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks (auth, Lens, contracts)
│   │   ├── lib/              # Utilities (Lens client, storage, API client)
│   │   ├── context/          # React context (AuthContext)
│   │   ├── schemas/          # Zod form validation schemas
│   │   └── types/            # TypeScript types
│   ├── public/               # Static assets (PWA manifest, icons)
│   └── CLAUDE.md            # PWA-specific guidance
│
├── cirkulo-api/              # REST API Backend
│   ├── src/
│   │   ├── routes/           # API endpoint handlers
│   │   ├── schemas/          # OpenAPI/Zod schemas
│   │   ├── db/               # Drizzle ORM setup + migrations
│   │   └── lib/              # Auth utilities
│   ├── docs/                 # Comprehensive API documentation
│   └── docker-compose.yml    # PostgreSQL setup
│
└── cirkulo-contracts/        # Smart Contracts (Scaffold-ETH 2)
    ├── packages/
    │   ├── hardhat/          # Solidity contracts, tests, deployments
    │   │   ├── contracts/    # Smart contract source
    │   │   ├── deploy/       # Deployment scripts
    │   │   └── test/         # Contract tests
    │   └── nextjs/           # Contract debugging UI (unused in prod)
    └── CLAUDE.md            # Contracts-specific guidance
```

## Quick Start Commands

### PWA Development
```bash
cd cirkulo-pwa
pnpm dev          # Start dev server at http://localhost:5173
pnpm typecheck    # TypeScript type checking
pnpm build        # Production build
```

### API Development
```bash
cd cirkulo-api
bun run docker:up    # Start PostgreSQL
bun run db:push      # Push schema changes
bun run dev          # Start API at http://localhost:8000
# Visit http://localhost:8000/swagger for API docs
```

### Smart Contracts Development
```bash
cd cirkulo-contracts
yarn chain        # Start local Hardhat network (terminal 1)
yarn deploy       # Deploy contracts (terminal 2)
yarn start        # Start NextJS debug UI (terminal 3)
```

## Architecture & Data Flow

### Authentication Flow

1. **Wallet Connection** (Dynamic.xyz)
   - User connects wallet via Dynamic in PWA (`/login`)
   - Dynamic provides wallet address + signing capability
   - Stored in `AuthContext` (`cirkulo-pwa/app/context/auth-context.tsx`)

2. **Lens Account Check** (Lens Protocol)
   - PWA fetches Lens accounts for connected wallet address
   - Uses `useFetchLensAccounts` hook (`cirkulo-pwa/app/hooks/fetch-lens-accounts.ts`)
   - Two scenarios:
     - **0 accounts**: Redirect to `/onboarding` (create new Lens account)
     - **1+ accounts**: Redirect to `/select-account` (user confirms/selects account)

3. **Lens Authentication**
   - PWA authenticates with Lens Protocol as account owner
   - Creates `SessionClient` for Lens operations (posting, groups, etc.)
   - Session stored in `AuthContext` and persisted to localStorage
   - Uses `authenticateAsAccountOwner` function (`cirkulo-pwa/app/hooks/authenticate-account.ts`)

4. **Session Management**
   - Lens session auto-resumes on page reload
   - Session expiration triggers logout via `authEvents` emitter
   - User redirected to `/login` when session expires

### Circle Creation Flow

1. **User Creates Circle** (`/create-circle` route)
   - Form validated with `react-hook-form` + Zod schema
   - Circle metadata uploaded to Lens Storage (decentralized)
   - Lens Group created via Lens Protocol SDK
   - Smart contract deployment triggered via API

2. **Smart Contract Deployment**
   - API receives circle creation request
   - Factory contract deploys new savings pool contract
   - Pool address stored in database
   - Pool address linked to Lens Group in PWA

3. **Circle Operations**
   - Members contribute via smart contract transactions
   - Contributions tracked on-chain (Citrea)
   - Circle feed/activity managed via Lens Protocol
   - Off-chain data (invites, metadata) stored in PostgreSQL

### Technology Integration

```
User Wallet (Dynamic)
    ↓
Lens Protocol (Social Identity)
    ↓
PWA (React Router 7) ←→ API (Hono + PostgreSQL)
    ↓                           ↓
Citrea Smart Contracts ←→ Contract Factory
    ↓
Bitcoin Settlement (via Citrea rollup)
```

## Important Patterns

### Async Logic Pattern (PWA)

**Pattern**: Extract async operations into custom hooks in `app/hooks/`

```typescript
// app/hooks/create-lens-account.ts

// 1. Export standalone async functions (can be called independently)
export async function authenticateAsOnboardingUser(...) { ... }
export async function checkUsername(...) { ... }

// 2. Export custom hook for component-level state management
export function useCreateLensAccount() {
  const [isCreating, setIsCreating] = useState(false);
  const createAccount = useCallback(async (params) => { ... }, []);
  return { createAccount, isCreating, error };
}
```

**Benefits**: Separation of concerns, reusability, testability, early execution patterns

**When to Use**: Complex async operations (API calls, blockchain transactions, authentication)

### Form Management Pattern (PWA)

**Pattern**: Use `react-hook-form` + Zod for all forms

```typescript
// app/schemas/onboarding-schema.ts
export const onboardingSchema = z.object({
  name: z.string().min(2).describe("User's full name"),
  lensUsername: z.string().min(3).max(26).regex(/^[a-z0-9_]+$/),
});

// In component
const { register, handleSubmit, setError, formState: { errors } } = useForm({
  resolver: zodResolver(onboardingSchema),
});
```

**Benefits**: Type safety, automatic validation, async server-side validation support

**Location**: Schemas in `app/schemas/`, used in routes with forms

### API Endpoint Pattern (API)

**Pattern**: Hono + OpenAPI for type-safe, documented APIs

```typescript
// src/schemas/feature.ts
export const createResourceRoute = createRoute({
  method: "post",
  path: "/resources",
  tags: ["Resources"],
  request: { body: { content: { "application/json": { schema: CreateResourceSchema } } } },
  responses: { 201: { ... }, 400: { ... } },
});

// src/routes/feature.ts
const routes = new OpenAPIHono();
routes.openapi(createResourceRoute, async (c) => {
  const body = c.req.valid("json");
  // Business logic
  return c.json(result, 201);
});
```

**Reference**: See `cirkulo-api/docs/API_STANDARDS.md` for comprehensive guidelines

### Smart Contract Interaction (Contracts)

**Pattern**: Use Scaffold-ETH hooks (NEVER use raw wagmi/viem)

```typescript
// Reading contract data
const { data } = useScaffoldReadContract({
  contractName: "XershaFactory",
  functionName: "getPool",
  args: [poolAddress],
});

// Writing to contract
const { writeContractAsync } = useScaffoldWriteContract({ contractName: "SavingsPool" });
await writeContractAsync({
  functionName: "contribute",
  value: parseEther("0.1"),
});
```

**Location**: `cirkulo-contracts/packages/nextjs/hooks/scaffold-eth/`

## Environment Variables

### PWA (`cirkulo-pwa/.env`)
```bash
VITE_DYNAMIC_ENVIRONMENT_ID=...    # Dynamic.xyz auth
VITE_LENS_APP_ADDRESS=...          # Lens Protocol app address
VITE_API_BASE_URL=...              # API endpoint (if not default)
```

### API (`cirkulo-api/.env`)
```bash
DATABASE_URL=...                    # PostgreSQL connection string
RESEND_API_KEY=...                 # Email service for invites
FROM_EMAIL=...                     # Verified sender email
APP_URL=...                        # Frontend URL for invite links
```

### Contracts (`cirkulo-contracts/packages/hardhat/.env`)
```bash
DEPLOYER_PRIVATE_KEY=...           # Generated via `yarn generate`
ALCHEMY_API_KEY=...                # RPC provider
ETHERSCAN_API_KEY=...              # Contract verification
```

## Cross-Package Communication

### PWA → API
- Base URL: `http://localhost:8000` (dev) or configured via `VITE_API_BASE_URL`
- API client: `cirkulo-pwa/app/lib/api-client.ts`
- Authentication: JWT tokens from Lens Protocol passed in `Authorization` header
- Key endpoints: `/api/circles/invites`, `/api/auth/validate`

### PWA → Smart Contracts
- RPC: Citrea testnet via wagmi config (`cirkulo-pwa/app/lib/wagmi.ts`)
- ABIs: Imported from `cirkulo-pwa/app/lib/abi.ts` (manually maintained)
- Contract addresses: Stored in database, fetched via API
- Key contracts: `XershaFactory`, `SavingsPool`, `DonationPool`, `ROSCAPool`

### API → Smart Contracts
- Web3 provider: ethers.js v6 (`cirkulo-api/src/lib/...`)
- Factory interaction: Deploy new pools via `XershaFactory.createPool()`
- Event monitoring: Listen for `PoolCreated` events (future feature)

### Contracts → PWA
- Contract events read via `useScaffoldEventHistory` hook
- Real-time updates: Poll contract state every N seconds (configurable)
- Transaction tracking: Wait for confirmations, show loading states

## Development Workflow

### Adding a New Feature (Full Stack)

1. **Define Data Model**
   - Update database schema: `cirkulo-api/src/db/schema.ts`
   - Run migration: `bun run db:push`

2. **Create API Endpoints**
   - Schema: `cirkulo-api/src/schemas/feature.ts`
   - Routes: `cirkulo-api/src/routes/feature.ts`
   - Register: `cirkulo-api/src/routes/index.ts`
   - Test: Visit `/swagger` UI

3. **Update Smart Contracts (if needed)**
   - Write contract: `cirkulo-contracts/packages/hardhat/contracts/Feature.sol`
   - Write tests: `cirkulo-contracts/packages/hardhat/test/Feature.ts`
   - Deploy script: `cirkulo-contracts/packages/hardhat/deploy/XX_deploy_feature.ts`
   - Deploy: `yarn deploy --network citrea`

4. **Build PWA UI**
   - Create route: `cirkulo-pwa/app/routes/feature.tsx`
   - Register route: `cirkulo-pwa/app/routes.ts`
   - Add component: `cirkulo-pwa/app/components/feature/...`
   - Create hook (if async): `cirkulo-pwa/app/hooks/use-feature.ts`
   - Add schema (if form): `cirkulo-pwa/app/schemas/feature-schema.ts`

5. **Test Integration**
   - Start all services: PWA, API, contracts
   - Test end-to-end user flow
   - Check error handling at each layer

### Common Development Tasks

**Update Contract ABIs in PWA:**
```bash
# After deploying contracts, copy ABIs
cd cirkulo-contracts
yarn deploy
# Manually copy ABI from packages/hardhat/deployments/ to cirkulo-pwa/app/lib/abi.ts
```

**Database Changes:**
```bash
cd cirkulo-api
# Edit src/db/schema.ts
bun run db:generate    # Generate migration
bun run db:migrate     # Apply migration
```

**Add New Route (PWA):**
```bash
# 1. Create route file: app/routes/my-feature.tsx
# 2. Register in app/routes.ts using route() or index()
# 3. Restart dev server (HMR doesn't catch route changes)
```

**Test Smart Contracts:**
```bash
cd cirkulo-contracts
yarn hardhat:test                      # Run all tests
yarn hardhat:test --grep "PoolName"    # Run specific test
```

## Key Files Reference

### PWA Key Files
- `app/routes.ts` - Route definitions (React Router 7 config)
- `app/context/auth-context.tsx` - Authentication state management
- `app/lib/lens.ts` - Lens Protocol client initialization
- `app/lib/wagmi.ts` - Wagmi config (Citrea network, Dynamic connector)
- `app/lib/api-client.ts` - API HTTP client
- `app/app.css` - Tailwind theme (OKLCH color system)

### API Key Files
- `src/index.ts` - Hono app entry, Swagger setup
- `src/routes/index.ts` - Route aggregator
- `src/db/schema.ts` - Drizzle database schema
- `src/lib/auth.ts` - JWT validation utilities

### Contracts Key Files
- `packages/hardhat/contracts/XershaFactory.sol` - Factory for deploying pools
- `packages/hardhat/contracts/pools/SavingsPool.sol` - Main savings circle contract
- `packages/hardhat/deploy/` - Deployment scripts (run in order)
- `packages/hardhat/hardhat.config.ts` - Network config (Citrea testnet)

## Package-Specific Documentation

For detailed package-specific guidance, refer to:

- **PWA Details**: `cirkulo-pwa/CLAUDE.md`
  - React Router 7 patterns, component structure, design system (OKLCH colors, logos)
  - Async hooks pattern, form management, Lens Protocol integration
  - PWA configuration, mobile-first design, accessibility

- **API Details**: `cirkulo-api/docs/`
  - `API_STANDARDS.md` - Endpoint development guidelines
  - `DATABASE.md` - Drizzle ORM patterns, migrations
  - `EXAMPLES.md` - Copy-paste code examples

- **Contracts Details**: `cirkulo-contracts/CLAUDE.md`
  - Scaffold-ETH 2 workflow, smart contract patterns
  - Hardhat commands, deployment process, testing
  - Contract interaction hooks (useScaffoldReadContract, etc.)

## Technology Learning Resources

- **React Router 7**: https://reactrouter.com
- **Lens Protocol**: https://docs.lens.xyz
- **Citrea (Bitcoin L2)**: https://citrea.xyz
- **Dynamic.xyz (Wallet Auth)**: https://docs.dynamic.xyz
- **Hono Framework**: https://hono.dev
- **Scaffold-ETH 2**: https://docs.scaffoldeth.io
- **Tailwind CSS v4**: https://tailwindcss.com

## Important Notes

### React Imports
- **ALWAYS** use `import { useEffect } from "react"` - NOT `React.useEffect`
- This applies to all React hooks and components
- Configured in global user settings (`.claude/CLAUDE.md`)

### Authentication State
- Authentication is managed in `AuthContext` (PWA)
- Access via `useAuth()` hook in any component
- Never directly access Dynamic context - use AuthContext abstraction
- Lens session persists across page reloads via localStorage

### Lens Protocol Integration
- All Lens operations require authenticated `SessionClient`
- Session obtained via `authenticateAsAccountOwner` or `authenticateAsOnboardingUser`
- Groups (circles) are Lens Groups with custom metadata stored on Lens Storage
- Profile metadata (name, bio, avatar) uploaded to Lens Storage (decentralized IPFS)

### Smart Contract Addresses
- Contracts deployed to Citrea testnet
- Factory address: Retrieved from deployment artifacts or environment variable
- Pool addresses: Dynamic, created via factory, stored in database
- Always verify contract addresses before transactions

### Error Handling
- PWA: Use try-catch with user-friendly toast notifications (`app/lib/toast.ts`)
- API: Return consistent error format `{ error: string, details?: string }`
- Contracts: Handle reverts gracefully, show transaction status to user

### Styling Conventions (PWA)
- Light mode only (enforced in `root.tsx`)
- Mobile-first responsive design (use `sm:`, `md:`, `lg:` breakpoints)
- OKLCH color space for perceptually uniform colors
- Primary (orange #ea7c3f) from Citrea brand, Secondary (purple) for accents

## Development Tips

1. **Start All Services**: PWA, API, and contracts (if testing blockchain) must all run concurrently for full functionality
2. **Use TypeScript Strictly**: All packages use strict TypeScript, no `any` types
3. **Test in Swagger First**: When building API endpoints, test in Swagger UI before integrating with PWA
4. **Watch Console Logs**: Auth flow has detailed console logs prefixed with `[AuthContext]`, `[Lens]`, etc.
5. **Check Package Managers**: PWA uses `pnpm`, API uses `bun`, Contracts use `yarn` - don't mix them
