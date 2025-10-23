/**
 * LocalStorage management for pending invite codes
 * Handles storing, retrieving, and clearing invite data for post-login processing
 */

const INVITE_CODE_KEY = "pending_invite_code";
const INVITE_METADATA_KEY = "pending_invite_metadata";

/**
 * Pending invite data structure
 */
export interface PendingInvite {
	code: string;
	groupAddress: string;
	circleName?: string;
	inviterName?: string;
	timestamp: number;
}

/**
 * Store invite code and metadata for post-login processing
 * 
 * @param invite - Invite data without timestamp
 * 
 * @example
 * ```typescript
 * storePendingInvite({
 *   code: "abc-123",
 *   groupAddress: "0x123...",
 *   circleName: "My Circle",
 *   inviterName: "john.lens"
 * });
 * ```
 */
export function storePendingInvite(invite: Omit<PendingInvite, "timestamp">) {
	try {
		const pendingInvite: PendingInvite = {
			...invite,
			timestamp: Date.now(),
		};

		localStorage.setItem(INVITE_CODE_KEY, invite.code);
		localStorage.setItem(INVITE_METADATA_KEY, JSON.stringify(pendingInvite));

		console.log("[InviteStorage] Stored pending invite:", {
			code: invite.code,
			groupAddress: invite.groupAddress,
		});
	} catch (error) {
		console.error("[InviteStorage] Failed to store invite:", error);
		// Fail silently - user can retry from email link
	}
}

/**
 * Retrieve pending invite from localStorage
 * Returns null if no invite exists or if invite has expired
 * 
 * @returns Pending invite data or null
 */
export function getPendingInvite(): PendingInvite | null {
	try {
		const code = localStorage.getItem(INVITE_CODE_KEY);
		const metadataStr = localStorage.getItem(INVITE_METADATA_KEY);

		if (!code || !metadataStr) {
			return null;
		}

		const metadata = JSON.parse(metadataStr) as PendingInvite;

		// Check if invite is expired (older than 7 days)
		const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
		if (Date.now() - metadata.timestamp > sevenDaysMs) {
			console.log("[InviteStorage] Pending invite expired, clearing");
			clearPendingInvite();
			return null;
		}

		console.log("[InviteStorage] Retrieved pending invite:", {
			code: metadata.code,
			groupAddress: metadata.groupAddress,
		});

		return metadata;
	} catch (error) {
		console.error("[InviteStorage] Failed to retrieve invite:", error);
		return null;
	}
}

/**
 * Clear pending invite from localStorage
 * Called after successful join or when invite expires
 */
export function clearPendingInvite() {
	try {
		localStorage.removeItem(INVITE_CODE_KEY);
		localStorage.removeItem(INVITE_METADATA_KEY);
		console.log("[InviteStorage] Cleared pending invite");
	} catch (error) {
		console.error("[InviteStorage] Failed to clear invite:", error);
	}
}

/**
 * Check if there's a pending invite without retrieving it
 * Useful for conditional navigation logic
 * 
 * @returns true if pending invite exists
 */
export function hasPendingInvite(): boolean {
	try {
		return localStorage.getItem(INVITE_CODE_KEY) !== null;
	} catch (error) {
		return false;
	}
}
