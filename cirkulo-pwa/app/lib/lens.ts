/**
 * Lens Protocol Client
 *
 * Provides access to Lens Protocol testnet for social identity and session management.
 *
 * ## Lens Protocol Session Management
 *
 * **How Lens handles sessions:**
 * - Sessions are created via `lensClient.login()` with signed authentication message
 * - Session data (JWT tokens, account info) stored in the configured storage provider
 * - In browsers: Uses `window.localStorage` for session persistence
 * - In SSR/non-browser: Uses `InMemoryStorageProvider` (sessions don't persist)
 * - Session can be resumed via `lensClient.resumeSession()` to restore from storage
 *
 * **Storage keys:**
 * - Lens SDK stores session data under internal keys (managed by SDK)
 * - Storage key format: Likely `lens.*` or similar (SDK implementation detail)
 * - DO NOT manually modify Lens storage keys
 * - Use our custom `session-storage.ts` for additional metadata only
 *
 * **Session lifecycle:**
 * 1. Authenticate: `sessionClient = await lensClient.login({ accountOwner: { ... } })`
 * 2. SDK stores session in localStorage automatically
 * 3. Use: Perform operations with `sessionClient` (create groups, post, etc.)
 * 4. Resume: `sessionClient = await lensClient.resumeSession()` on page load
 * 5. Logout: `await sessionClient.logout()` clears session from storage
 *
 * **Session resumption:**
 * - Call `lensClient.resumeSession()` on app initialization
 * - Returns `Ok(sessionClient)` if valid session found in storage
 * - Returns `Err(error)` if no session or session expired/invalid
 * - Non-blocking failure is normal (user might not have Lens account yet)
 * - IMPORTANT: Validate session age before resuming (use session-storage.ts)
 *
 * **Session expiration:**
 * - Lens sessions are JWT-based with expiration timestamps
 * - SDK does NOT automatically refresh expired sessions
 * - When session expires, operations return error results
 * - IMPORTANT: No proactive expiration detection provided by SDK
 * - We must implement our own expiration tracking (see session-storage.ts)
 *
 * **Session validation:**
 * - Lens SDK doesn't provide explicit `isSessionValid()` or `verify()` method
 * - Best practice: Track expiration ourselves using session metadata
 * - Detect expiration by catching operation errors
 * - When operation fails with auth error → session likely expired
 *
 * **Multi-account support:**
 * - One Lens session active at a time per storage instance
 * - Logging in with different account replaces previous session
 * - To support multiple accounts: User must re-authenticate when switching
 * - Session storage contains only the currently authenticated account
 *
 * **Storage isolation:**
 * - Lens SDK session storage is separate from our app's session metadata
 * - Lens SDK: Manages JWT tokens and session state internally
 * - Our app: Manages session metadata (timestamps, account info) in session-storage.ts
 * - Both use localStorage, different keys, no conflicts
 *
 * **Keep-alive mechanism:**
 * - Lens SDK does NOT provide automatic session refresh
 * - Sessions have finite lifetime (determined by Lens Protocol backend)
 * - No client-side mechanism to extend session without re-authentication
 * - Best practice: Monitor expiration, prompt user to re-authenticate when needed
 *
 * **Error handling:**
 * - Session operations return `Result<T, Error>` type (functional error handling)
 * - Always check: `if (result.isOk()) { ... } else { handle result.error }`
 * - Common errors: Session expired, invalid signature, network failure
 * - When session error occurs: Clear metadata, log out, redirect to login
 *
 * @see {@link https://docs.lens.xyz} - Lens Protocol documentation
 */

import { PublicClient, testnet } from "@lens-protocol/client";
import { InMemoryStorageProvider } from "@lens-protocol/storage";

/**
 * Storage provider for Lens Protocol session persistence
 *
 * - Browser: Uses window.localStorage (sessions persist across page refreshes)
 * - SSR/Node: Uses InMemoryStorageProvider (sessions are lost on restart)
 */
const storage =
	typeof window !== "undefined" && window.localStorage
		? window.localStorage
		: new InMemoryStorageProvider();

/**
 * Lens Protocol Public Client
 *
 * Configured for Lens testnet environment with localStorage persistence.
 * Use this client to:
 * - Login and create sessions: `lensClient.login({ accountOwner: ... })`
 * - Resume sessions: `lensClient.resumeSession()`
 * - Fetch accounts: `lensClient.fetchAccounts({ owner: walletAddress })`
 *
 * @example
 * ```typescript
 * // Resume existing session
 * const resumed = await lensClient.resumeSession();
 * if (resumed.isOk()) {
 *   const sessionClient = resumed.value;
 *   // Use sessionClient for operations
 * }
 *
 * // Create new session
 * const login = await lensClient.login({
 *   accountOwner: {
 *     account: accountAddress,
 *     owner: walletAddress,
 *     app: appAddress,
 *   },
 *   signMessage: (message) => walletClient.signMessage({ message }),
 * });
 * ```
 */
export const lensClient = PublicClient.create({
	environment: testnet,
	storage,
});
