/**
 * Session Storage Utilities
 *
 * Manages session metadata for authentication state persistence.
 * Works alongside Lens Protocol SDK's internal session storage to track
 * session lifecycle, expiration, and account information.
 */

const SESSION_META_KEY = "xersha.session.meta";

/**
 * Session metadata structure
 */
export interface SessionMetadata {
	/** Timestamp when session was created (ms since epoch) */
	createdAt: number;
	/** Timestamp when session expires (ms since epoch) */
	expiresAt: number;
	/** Lens account address that was authenticated */
	accountAddress: string;
	/** Wallet address used for authentication */
	walletAddress: string;
	/** Lens username for display purposes */
	username?: string;
}

/**
 * Default session duration (24 hours in milliseconds)
 * Can be adjusted based on Lens Protocol's actual session TTL
 */
const DEFAULT_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Store session metadata in localStorage
 *
 * @param accountAddress - Lens account address
 * @param walletAddress - Wallet address used for authentication
 * @param username - Optional Lens username
 * @param durationMs - Session duration in milliseconds (default: 24 hours)
 *
 * @example
 * ```typescript
 * setSessionMetadata(
 *   "0x123...",
 *   "0xabc...",
 *   "alice.lens",
 *   24 * 60 * 60 * 1000
 * );
 * ```
 */
export function setSessionMetadata(
	accountAddress: string,
	walletAddress: string,
	username?: string,
	durationMs: number = DEFAULT_SESSION_DURATION_MS,
): void {
	const now = Date.now();

	const metadata: SessionMetadata = {
		createdAt: now,
		expiresAt: now + durationMs,
		accountAddress,
		walletAddress,
		username,
	};

	try {
		localStorage.setItem(SESSION_META_KEY, JSON.stringify(metadata));
		console.log(
			"[SessionStorage] Stored session metadata:",
			metadata.username || metadata.accountAddress,
		);
	} catch (error) {
		console.error("[SessionStorage] Failed to store session metadata:", error);
	}
}

/**
 * Retrieve session metadata from localStorage
 *
 * @returns Session metadata if valid, null if not found or invalid
 *
 * @example
 * ```typescript
 * const meta = getSessionMetadata();
 * if (meta) {
 *   console.log("Session expires at:", new Date(meta.expiresAt));
 * }
 * ```
 */
export function getSessionMetadata(): SessionMetadata | null {
	try {
		const stored = localStorage.getItem(SESSION_META_KEY);
		if (!stored) {
			return null;
		}

		const metadata: SessionMetadata = JSON.parse(stored);

		// Validate required fields
		if (
			!metadata.createdAt ||
			!metadata.expiresAt ||
			!metadata.accountAddress ||
			!metadata.walletAddress
		) {
			console.warn(
				"[SessionStorage] Invalid session metadata structure, clearing",
			);
			clearSessionMetadata();
			return null;
		}

		return metadata;
	} catch (error) {
		console.error("[SessionStorage] Failed to retrieve session metadata:", error);
		clearSessionMetadata();
		return null;
	}
}

/**
 * Clear session metadata from localStorage
 *
 * Should be called on logout or when session becomes invalid
 *
 * @example
 * ```typescript
 * clearSessionMetadata();
 * ```
 */
export function clearSessionMetadata(): void {
	try {
		localStorage.removeItem(SESSION_META_KEY);
		console.log("[SessionStorage] Cleared session metadata");
	} catch (error) {
		console.error("[SessionStorage] Failed to clear session metadata:", error);
	}
}

/**
 * Check if stored session is expired
 *
 * @param bufferMs - Optional buffer time in milliseconds to consider session "expired"
 *                   before actual expiration (default: 0)
 *
 * @returns true if session is expired or not found, false if still valid
 *
 * @example
 * ```typescript
 * // Check if session expired
 * if (isSessionExpired()) {
 *   console.log("Session expired, need to re-authenticate");
 * }
 *
 * // Check if session expires within 10 minutes
 * if (isSessionExpired(10 * 60 * 1000)) {
 *   console.log("Session expiring soon, show warning");
 * }
 * ```
 */
export function isSessionExpired(bufferMs: number = 0): boolean {
	const metadata = getSessionMetadata();

	if (!metadata) {
		return true; // No session metadata = expired
	}

	const now = Date.now();
	const expiresAt = metadata.expiresAt - bufferMs;

	return now >= expiresAt;
}

/**
 * Get time remaining until session expiration
 *
 * @returns Milliseconds until expiration, or null if no valid session
 *
 * @example
 * ```typescript
 * const remaining = getSessionTimeRemaining();
 * if (remaining !== null && remaining < 10 * 60 * 1000) {
 *   showWarning("Session expires in " + Math.floor(remaining / 60000) + " minutes");
 * }
 * ```
 */
export function getSessionTimeRemaining(): number | null {
	const metadata = getSessionMetadata();

	if (!metadata) {
		return null;
	}

	const now = Date.now();
	const remaining = metadata.expiresAt - now;

	return Math.max(0, remaining); // Never negative
}

/**
 * Check if session metadata wallet matches current wallet
 *
 * Useful for detecting wallet switches that invalidate the session
 *
 * @param currentWalletAddress - Current connected wallet address
 * @returns true if wallet matches, false otherwise
 *
 * @example
 * ```typescript
 * if (!isSessionWalletValid(primaryWallet.address)) {
 *   console.log("Wallet changed, session invalid");
 *   clearSessionMetadata();
 * }
 * ```
 */
export function isSessionWalletValid(
	currentWalletAddress: string,
): boolean {
	const metadata = getSessionMetadata();

	if (!metadata) {
		return false;
	}

	// Case-insensitive comparison (Ethereum addresses)
	return (
		metadata.walletAddress.toLowerCase() ===
		currentWalletAddress.toLowerCase()
	);
}

/**
 * Get session age in milliseconds
 *
 * @returns Age in milliseconds, or null if no valid session
 *
 * @example
 * ```typescript
 * const age = getSessionAge();
 * if (age !== null) {
 *   console.log("Session created", Math.floor(age / 60000), "minutes ago");
 * }
 * ```
 */
export function getSessionAge(): number | null {
	const metadata = getSessionMetadata();

	if (!metadata) {
		return null;
	}

	const now = Date.now();
	return now - metadata.createdAt;
}
