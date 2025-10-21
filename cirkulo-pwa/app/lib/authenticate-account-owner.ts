/**
 * Authenticate Account Owner
 *
 * Helper functions for authenticating as a specific Lens account owner.
 * Used when users have multiple accounts and need to switch between them.
 */

import type { SessionClient } from "@lens-protocol/client";

/**
 * Authentication result
 */
export interface AuthenticationResult {
	success: boolean;
	sessionClient?: SessionClient;
	error?: {
		message: string;
		code?: string;
	};
}

/**
 * Authenticate as an account owner using an existing session client
 *
 * @param accountAddress - The Lens account address to authenticate as
 * @param sessionClient - Existing session client (must be authenticated)
 * @returns Authentication result with updated session client
 *
 * @example
 * const result = await authenticateAccountOwner(
 *   "0x1234...abcd",
 *   sessionClient
 * );
 *
 * if (result.success) {
 *   // User is now authenticated as the selected account
 *   console.log("Authenticated as:", accountAddress);
 * }
 */
export async function authenticateAccountOwner(
	accountAddress: string,
	sessionClient: SessionClient,
): Promise<AuthenticationResult> {
	try {
		console.log(
			"[AuthenticateAccountOwner] Switching to account:",
			accountAddress,
		);

		// Switch to the selected account using the session client
		const switchResult = await sessionClient.switchAccount({
			account: accountAddress,
		});

		if (switchResult.isErr()) {
			console.error(
				"[AuthenticateAccountOwner] Switch account failed:",
				switchResult.error,
			);
			return {
				success: false,
				error: {
					message:
						switchResult.error.message || "Failed to switch to selected account",
					code: "SWITCH_ACCOUNT_FAILED",
				},
			};
		}

		console.log(
			"[AuthenticateAccountOwner] Successfully switched to account:",
			accountAddress,
		);

		return {
			success: true,
			sessionClient,
		};
	} catch (err) {
		console.error("[AuthenticateAccountOwner] Error:", err);
		return {
			success: false,
			error: {
				message:
					err instanceof Error
						? err.message
						: "Failed to authenticate as account owner",
				code: "AUTHENTICATION_ERROR",
			},
		};
	}
}
