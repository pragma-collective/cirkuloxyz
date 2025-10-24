# Authentication System

Complete documentation for Cirkulo's dual-session authentication architecture.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication Flows](#authentication-flows)
4. [Contexts Deep Dive](#contexts-deep-dive)
5. [Navigation & Route Guards](#navigation--route-guards)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### Dual-Session Architecture

Cirkulo uses two independent authentication sessions that must work together:

**1. Dynamic Wallet Session**
- Managed by Dynamic SDK (third-party)
- Handles wallet connection (MetaMask, WalletConnect, etc.)
- Persisted automatically in browser storage by Dynamic
- Provides `user` and `primaryWallet` objects

**2. Lens Protocol Session**
- Managed by our code using Lens SDK
- Handles social identity and account management
- Persisted in localStorage with metadata
- Provides `SessionClient` for Lens API operations

### Key Concepts

**Loading States:**
- `wallet.isLoading`: Manual connect in progress OR Dynamic SDK initializing
- `lens.isLoadingAccounts`: Fetching Lens accounts for wallet
- `lens.isResumingSession`: Attempting to resume Lens session from storage
- `auth.isLoading`: Combined loading state (all three above)

**Connection States:**
- `wallet.isConnected`: User has wallet connected (Dynamic session active)
- `lens.sessionClient`: User has Lens session (can post, create groups, etc.)
- `auth.hasLensSession`: Same as `!!lens.sessionClient`

**Critical Timing:**
- Dynamic SDK takes 100-200ms to initialize from storage on page load
- Lens session resume takes 200-500ms after wallet is available
- Navigation logic MUST wait for both before making routing decisions

---

## Architecture

### Context Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ DynamicContextProvider (Dynamic SDK)                        │
│ └─ WagmiProvider (Ethereum interactions)                    │
│    └─ DynamicWagmiConnector (Connects Dynamic to Wagmi)     │
│       └─ WalletProvider (Wallet state management)           │
│          └─ LensProvider (Lens session management)          │
│             └─ AuthProvider (Unified auth orchestration)    │
│                └─ App Routes                                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
app/
├── components/
│   ├── auth-layout.tsx          # Root auth wrapper with all providers
│   ├── authenticated-route.tsx  # Route guard for protected routes
│   └── auth-flow-guard.tsx      # Route guard for onboarding/select-account
│
├── context/
│   ├── wallet-context.tsx       # Dynamic wallet integration
│   ├── lens-context.tsx         # Lens Protocol sessions
│   └── auth-context.tsx         # Unified auth orchestration
│
├── hooks/
│   ├── use-auth-navigation.ts   # Auto-navigation based on auth state
│   ├── fetch-lens-accounts.ts   # Fetch Lens accounts for wallet
│   ├── authenticate-account.ts  # Create Lens session
│   └── create-lens-account.ts   # Create new Lens account
│
└── lib/
    ├── auth-events.ts           # Event bus for auth coordination
    ├── session-storage.ts       # Lens session metadata persistence
    ├── lens.ts                  # Lens client initialization
    └── wagmi.ts                 # Wagmi config with Citrea network
```

### Data Flow

```
┌──────────────────┐
│  Dynamic SDK     │ (manages wallet session)
└────────┬─────────┘
         │ user, primaryWallet, sdkHasLoaded
         ▼
┌──────────────────┐
│ WalletContext    │ (wallet state + loading coordination)
└────────┬─────────┘
         │ walletAddress, isConnected, isLoading
         ▼
┌──────────────────┐
│  LensContext     │ (Lens session + account management)
└────────┬─────────┘
         │ sessionClient, accounts, selectedAccount
         ▼
┌──────────────────┐
│  AuthContext     │ (unified interface + navigation)
└────────┬─────────┘
         │ user, hasLensSession, isLoading
         ▼
┌──────────────────┐
│  App Components  │
└──────────────────┘
```

---

## Authentication Flows

### 1. Initial Login Flow

**User Journey:** Landing page → Login → Wallet Connect → Lens Account Selection → Dashboard

```
1. User clicks "Sign In" button
   └─> AuthContext.login() called

2. WalletContext shows Dynamic modal
   └─> User selects wallet and connects
   └─> Dynamic SDK authenticates
   └─> authEvents.emit("authSuccess")
   └─> wallet.isConnected = true

3. LensContext fetches accounts for wallet
   └─> useFetchLensAccounts(walletAddress) runs
   └─> lens.accounts populated
   └─> lens.hasAccountsFetched = true

4. Navigation logic evaluates:

   If accounts.length === 0:
   └─> Navigate to /onboarding (create new account)

   If accounts.length === 1:
   └─> Auto-select account
   └─> AuthContext.selectAccount() called
   └─> Lens session created
   └─> Navigate to /dashboard

   If accounts.length >= 2:
   └─> Navigate to /select-account (user chooses)
   └─> User selects account
   └─> AuthContext.selectAccount() called
   └─> Lens session created
   └─> Navigate to /dashboard

5. User is fully authenticated
   └─> wallet.isConnected = true
   └─> lens.sessionClient exists
   └─> Can access all protected routes
```

**Timing:**
- Wallet connection: 2-5 seconds (user interaction)
- Account fetch: 500-1000ms (API call)
- Session creation: 1-2 seconds (signature required)
- Total: 4-8 seconds

### 2. Session Resume Flow (Page Refresh)

**Critical:** This flow must complete BEFORE navigation logic runs.

```
1. Page loads, React renders providers

2. Dynamic SDK initializes (100-200ms)
   └─> sdkHasLoaded = false initially
   └─> wallet.isLoading = true
   └─> Navigation BLOCKED (waiting for loading to complete)

3. Dynamic SDK restores wallet from storage
   └─> sdkHasLoaded = true
   └─> wallet.isConnected = true
   └─> wallet.isLoading = false (Dynamic loading complete)

4. LensContext attempts session resume
   └─> Checks localStorage for session metadata
   └─> Validates wallet address matches
   └─> Calls lensClient.resumeSession()

   If resume succeeds:
   └─> setSessionClient(client)
   └─> lens.isResumingSession = false
   └─> React batches state updates

   If resume fails:
   └─> clearSessionMetadata()
   └─> authEvents.emit("logout")
   └─> Wallet session cleared
   └─> Navigate to /login

5. Lens accounts fetched
   └─> useFetchLensAccounts runs
   └─> lens.accounts populated
   └─> lens.hasAccountsFetched = true

6. Fallback: Restore selectedAccount
   └─> Matches sessionClient to account in accounts array
   └─> setSelectedAccount(matchedAccount)

7. Navigation logic evaluates
   └─> hasLensSession = true
   └─> walletConnected = true
   └─> Early exit: No navigation needed
   └─> User stays on current page

8. AuthenticatedRoute renders
   └─> Sees hasLensSession = true
   └─> Renders protected route content
```

**Timing:**
- Dynamic SDK init: 100-200ms
- Lens resume: 200-500ms
- Account fetch: 500-1000ms
- Total: 800-1700ms (brief loading spinner)

### 3. Logout Flow

```
1. User clicks "Sign Out" button
   └─> AuthContext.logout() called

2. Lens logout
   └─> sessionClient.logout() if exists
   └─> setSessionClient(null)
   └─> setSelectedAccount(undefined)
   └─> clearSessionMetadata()

3. Wallet logout
   └─> Dynamic handleLogOut() called
   └─> Clears wallet connection
   └─> Emits authEvents.emit("logout")
   └─> wallet.isConnected = false

4. LensContext listens for logout event
   └─> Clears any remaining Lens state
   └─> Ensures clean logout

5. Navigation logic evaluates
   └─> walletConnected = false
   └─> Navigate to /login

6. User is logged out
```

**Timing:** Near-instant (100-200ms)

---

## Contexts Deep Dive

### WalletContext

**File:** `app/context/wallet-context.tsx`

**Responsibilities:**
1. Integrate with Dynamic SDK for wallet connection
2. Track wallet loading state (including SDK initialization)
3. Provide wallet connection/disconnection methods
4. Emit auth events for coordination with other contexts

**Key State:**
```typescript
{
  walletAddress: string | null;         // Connected wallet address
  user: WalletUser | null;              // Dynamic user info
  isConnected: boolean;                 // Has wallet + user
  isLoading: boolean;                   // Manual connect OR SDK init
}
```

**Critical Implementation Details:**

**1. Combined Loading State:**
```typescript
const combinedIsLoading = isLoading || !sdkHasLoaded;
```
- `isLoading`: Manual connect operation in progress
- `!sdkHasLoaded`: Dynamic SDK still initializing from storage
- Navigation MUST wait for `combinedIsLoading = false`

**2. User Memoization:**
```typescript
const user = useMemo(() => {
  if (!dynamicUser) return null;
  return {
    userId: dynamicUser.userId || "unknown",
    email: dynamicUser.email,
    username: dynamicUser.username,
  };
}, [dynamicUser?.userId, dynamicUser?.email, dynamicUser?.username]);
```
- Memoized by VALUES, not object reference
- Prevents unnecessary re-renders

**3. Auth Event Coordination:**
- Listens for `authSuccess` to resolve connect promises
- Listens for `logout` to reject pending promises

### LensContext

**File:** `app/context/lens-context.tsx`

**Responsibilities:**
1. Fetch Lens accounts for connected wallet
2. Manage Lens session creation and resumption
3. Track selected account (for multi-account users)
4. Store/retrieve session metadata in localStorage

**Key State:**
```typescript
{
  sessionClient: SessionClient | null;  // Lens API client
  accounts: LensAccount[];              // All accounts for wallet
  selectedAccount: LensAccount | undefined;
  isLoadingAccounts: boolean;           // Fetching accounts
  isResumingSession: boolean;           // Resuming from storage
  hasAccountsFetched: boolean;          // Fetch completed
}
```

**Critical Implementation Details:**

**1. Session Resume Effect:**
```typescript
useEffect(() => {
  if (!walletAddress) return;

  const resumeSession = async () => {
    const metadata = getSessionMetadata();
    if (!metadata) return;

    const resumed = await lensClient.resumeSession();
    if (resumed.isOk()) {
      setSessionClient(resumed.value);
      // React batches with isResumingSession = false
    }
  };

  resumeSession();
}, [walletAddress]); // Only wallet address dependency
```

**Key Points:**
- Runs when wallet connects (initial or page refresh)
- Validates session metadata before attempting resume
- No `accounts` dependency to prevent re-runs on account changes

**2. Fallback Account Restoration:**
```typescript
useEffect(() => {
  if (!sessionClient || selectedAccount || accounts.length === 0) return;

  const metadata = getSessionMetadata();
  const matchedAccount = accounts.find(
    acc => acc.address === metadata.accountAddress
  );

  if (matchedAccount) {
    setSelectedAccount(matchedAccount);
  }
}, [sessionClient, accounts, selectedAccount]);
```

**Why Needed:** Session resume completes before accounts are fetched, so we restore `selectedAccount` once accounts load.

**3. Auto-Selection for Single Account:**
```typescript
useEffect(() => {
  if (accounts.length === 1) {
    setSelectedAccount(accounts[0]);
  }
}, [accounts]);
```

### AuthContext

**File:** `app/context/auth-context.tsx`

**Responsibilities:**
1. Orchestrate wallet and Lens contexts
2. Provide unified authentication interface
3. Combine loading states from both sessions
4. Trigger navigation based on auth state

**Key State:**
```typescript
{
  user: User | null;              // Unified user object
  isLoading: boolean;             // Combined loading state
  hasLensSession: boolean;        // Has active Lens session
  sessionClient: SessionClient | null;
}
```

**Critical Implementation Details:**

**1. Combined Loading State:**
```typescript
const isLoading =
  wallet.isLoading ||           // Dynamic loading or manual connect
  lens.isLoadingAccounts ||     // Fetching Lens accounts
  lens.isResumingSession;       // Resuming Lens session
```

**2. Initial Auth Resolution:**
```typescript
const hasResolvedInitialAuth = !isLoading && (
  !wallet.isConnected ||        // No wallet = resolved
  lens.hasAccountsFetched       // Accounts fetched = resolved
);
```

**Why Important:** Prevents navigation from running with incomplete state (e.g., `accountCount: 0` while accounts are still loading).

**3. Auto-Navigation:**
```typescript
useAuthNavigation(
  wallet.isConnected,
  lens.accounts.length,
  !!lens.sessionClient,
  isLoading,
  hasResolvedInitialAuth,
);
```

Delegates to navigation hook to handle routing logic.

---

## Navigation & Route Guards

### Navigation Logic

**File:** `app/hooks/use-auth-navigation.ts`

**Decision Tree:**

```
Start
  │
  ├─> hasLensSession && walletConnected?
  │   └─> YES: Early exit (no navigation needed)
  │
  ├─> !hasResolvedInitialAuth?
  │   └─> YES: Wait (don't navigate yet)
  │
  ├─> isLoading?
  │   └─> YES: Wait (don't navigate yet)
  │
  └─> Evaluate navigation destination:
      │
      ├─> !walletConnected
      │   └─> Navigate to /login
      │
      ├─> accountCount === 0
      │   └─> Navigate to /onboarding
      │
      ├─> accountCount === 1
      │   └─> Navigate to /dashboard
      │
      └─> accountCount >= 2
          └─> Navigate to /select-account
```

**Critical Details:**

**1. Early Exit for Authenticated Users:**
```typescript
if (hasLensSession && walletConnected) {
  return; // Skip ALL navigation logic
}
```
- Prevents unnecessary re-evaluation on every render
- Must run BEFORE other checks to avoid navigation loops

**2. Wait for Complete State:**
```typescript
if (!hasResolvedInitialAuth) {
  return; // Don't navigate with incomplete state
}
```
- Ensures both Dynamic SDK and Lens accounts have loaded
- Prevents premature redirects during page load

**3. Dependencies:**
```typescript
}, [
  walletConnected,
  accountCount,
  hasLensSession,
  isLoading,
  hasResolvedInitialAuth,
  location.pathname,  // Safe due to early exit
]);
```

### Route Guards

#### AuthenticatedRoute

**File:** `app/components/authenticated-route.tsx`

**Purpose:** Protect routes requiring FULL authentication (wallet + Lens session)

**Logic:**
```typescript
// 1. Loading → Show spinner
if (isLoading) {
  return <LoadingSpinner />;
}

// 2. No wallet → Redirect to /login
if (!user) {
  return <Navigate to="/login" replace />;
}

// 3. No Lens session → Show spinner (navigation will handle)
if (!hasLensSession) {
  return <LoadingSpinner />;
}

// 4. Fully authenticated → Render route
return <Outlet />;
```

**Why Loading Spinner for No Session:**
- Returning `null` causes React to unmount components
- This triggers navigation with incomplete state
- Loading spinner keeps component mounted until session propagates

**Protected Routes:**
- `/dashboard`
- `/explore`
- `/create-circle`
- `/circles/:id`
- `/profile`
- `/settings`

#### AuthFlowGuard

**File:** `app/components/auth-flow-guard.tsx`

**Purpose:** Protect onboarding/select-account routes from authenticated users

**Logic:**
```typescript
// If has Lens session, redirect to dashboard
if (hasLensSession) {
  return <Navigate to="/dashboard" replace />;
}

// Otherwise, render route (onboarding/select-account)
return <Outlet />;
```

**Protected Routes:**
- `/onboarding` (create new Lens account)
- `/select-account` (choose from multiple accounts)

---

## Troubleshooting

### Common Issues

#### Issue: Stuck on login page despite having active sessions

**Symptoms:**
- Console shows "Session resume SUCCESS"
- Console shows "Authenticated user, no navigation needed"
- But immediately followed by "Navigating to /login - No wallet connected"

**Root Cause:**
- Navigation logic runs before Dynamic SDK finishes initializing
- `sdkHasLoaded: false` → `isConnected: false` (temporarily)
- Navigation sees "no wallet" and redirects

**Fix:**
- Include `sdkHasLoaded` in loading state calculation
- Wait for `wallet.isLoading: false` before evaluating navigation

**Relevant Code:**
```typescript
// wallet-context.tsx
const combinedIsLoading = isLoading || !sdkHasLoaded;
```

#### Issue: Redirected through onboarding/dashboard on page refresh

**Symptoms:**
- Refresh on `/profile`
- Briefly see `/onboarding` → `/dashboard` → back to `/profile`

**Root Cause:**
- Navigation runs before accounts are fetched
- `accountCount: 0` (temporarily) triggers onboarding redirect
- Then accounts load and navigation corrects

**Fix:**
- Add `hasFetched` state to distinguish "loading" from "fetch complete"
- Use `hasAccountsFetched` instead of `!isLoadingAccounts`

**Relevant Code:**
```typescript
// fetch-lens-accounts.ts
const [hasFetched, setHasFetched] = useState(false);
setHasFetched(true); // When fetch completes

// auth-context.tsx
const hasResolvedInitialAuth = !isLoading && (
  !wallet.isConnected || lens.hasAccountsFetched
);
```

#### Issue: Infinite navigation loop

**Symptoms:**
- Navigation keeps running on every render
- Console spam with navigation logs

**Root Cause:**
- `useAuthNavigation` effect dependencies include unstable references
- Effect runs on every render, triggers navigation, causes re-render

**Fix:**
- Memoize context values by VALUES, not object references
- Add early exit for authenticated users at TOP of effect
- Only include stable values in dependencies

**Relevant Code:**
```typescript
// use-auth-navigation.ts
useEffect(() => {
  // EARLY EXIT - prevents running for authenticated users
  if (hasLensSession && walletConnected) {
    return;
  }
  // ... rest of navigation logic
}, [walletConnected, accountCount, hasLensSession, ...]);
```

### Debug Logging

**Key Log Prefixes:**
- `[WalletContext]` - Dynamic SDK state, wallet connections
- `[LensContext]` - Session resume, account fetching
- `[AuthContext]` - Combined auth state changes
- `[AuthNavigation]` - Navigation decisions
- `[AuthenticatedRoute]` - Route guard state
- `[useFetchLensAccounts]` - Account fetch operations

**Typical Successful Flow Logs:**
```
[WalletContext] Dynamic SDK state: { sdkHasLoaded: false, ... }
[WalletContext] Dynamic SDK state: { sdkHasLoaded: true, isConnected: true }
[LensContext] Wallet connected, checking for session to resume
[LensContext] Attempting to resume Lens session...
[LensContext] Session resume SUCCESS, setting client
[LensContext] Session client state update dispatched
[AuthContext] Session client changed: { hasSessionClient: true, ... }
[useFetchLensAccounts] Starting fetch for: 0x0dfd...
[LensContext] Fallback: Restoring selected account
[useFetchLensAccounts] Fetch complete, found 2 accounts
[LensContext] Clearing isResumingSession flag
[AuthNavigation] Authenticated user, no navigation needed
[AuthenticatedRoute] Render: { hasSession: true, ... }
```

### State Inspection

**Check Auth State in Console:**
```javascript
// In browser console
window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.forEach(renderer => {
  // Find WalletContext
  // Find LensContext
  // Find AuthContext
});
```

**Manual State Checks:**
```typescript
// Add temporary logging in components
console.log('Auth State:', {
  walletConnected: wallet.isConnected,
  walletLoading: wallet.isLoading,
  accountCount: lens.accounts.length,
  hasSession: !!lens.sessionClient,
  isLoading: auth.isLoading,
});
```

### Recent Fixes (Jan 2025)

**1. Dynamic SDK Loading Race Condition**
- **Problem:** Navigation ran before Dynamic SDK initialized
- **Fix:** Include `sdkHasLoaded` in loading state
- **Commit:** Added `combinedIsLoading = isLoading || !sdkHasLoaded`

**2. Lens Session Resume State Batching**
- **Problem:** `setTimeout` broke React state batching
- **Fix:** Remove setTimeout, rely on React 18 automatic batching
- **Commit:** Removed setTimeout wrapper around `setIsResumingSession`

**3. Account Fetch Completion Tracking**
- **Problem:** `!isLoadingAccounts` true BEFORE fetch starts
- **Fix:** Add explicit `hasFetched` state
- **Commit:** Added `hasAccountsFetched` to distinguish loading from completion

**4. AuthenticatedRoute Null Return**
- **Problem:** Returning `null` caused unmount/remount loop
- **Fix:** Return loading spinner instead
- **Commit:** Changed `return null` to `return <LoadingSpinner />`

---

## Quick Reference

### Adding New Protected Route

```typescript
// 1. Add route in routes.ts
route("/new-route", "routes/new-route.tsx"),

// 2. Wrap in authenticated-route.tsx children array
// (Already done if route is under AuthenticatedRoute in layout)

// 3. Use auth state in component
import { useAuth } from "app/context/auth-context";

function NewRoute() {
  const { user, sessionClient, hasLensSession } = useAuth();

  // Component logic
}
```

### Accessing Wallet Client

```typescript
// DON'T use useWalletClient() in providers (causes re-renders)
const { primaryWallet } = useDynamicContext();

// DO use getWalletClient on-demand
import { getWalletClient } from "wagmi/actions";
import { wagmiConfig } from "app/lib/wagmi";

const walletClient = await getWalletClient(wagmiConfig);
```

### Checking Auth State

```typescript
// Wallet only
const { isConnected, walletAddress } = useWallet();

// Lens only
const { sessionClient, accounts, selectedAccount } = useLensSession();

// Combined (recommended)
const { user, hasLensSession, isLoading } = useAuth();
```

### Manual Logout

```typescript
const { logout } = useAuth();

await logout(); // Clears both wallet and Lens sessions
// User automatically navigated to /login
```

---

**Last Updated:** January 2025
**Maintainer:** Development Team
**Related Docs:**
- Dynamic SDK: https://docs.dynamic.xyz
- Lens Protocol: https://docs.lens.xyz
- React Router: https://reactrouter.com
