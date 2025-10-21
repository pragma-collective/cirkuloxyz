import {
	evmAddress,
	type EvmAddress,
	type SessionClient,
} from "@lens-protocol/client";
import { signMessageWith } from "@lens-protocol/client/viem";
import { lensClient } from "app/lib/lens";
import type { WalletClient } from "viem";

/**
 * Result of authentication as account owner
 */
export interface AuthenticationResult {
	/** Authenticated Lens session client */
	sessionClient?: SessionClient;
	/** Error if authentication failed */
	error?: Error;
}

/**
 * Authenticate with Lens Protocol as an account owner
 *
 * This function creates a new Lens session by authenticating the user as the owner
 * of a specific Lens account. Use this when a user selects one of their existing
 * Lens accounts and needs to authenticate with it.
 *
 * @param accountAddress - The Lens account address to authenticate with
 * @param walletAddress - The wallet address that owns the account
 * @param appAddress - The Lens app address (from environment variable)
 * @param walletClient - The viem wallet client for signing messages
 * @returns Promise with authenticated session client or error
 *
 * @example
 * ```tsx
 * const result = await authenticateAsAccountOwner(
 *   account.address,
 *   primaryWallet.address,
 *   import.meta.env.VITE_LENS_APP_ADDRESS,
 *   walletClient
 * );
 *
 * if (result.error) {
 *   console.error("Authentication failed:", result.error);
 * } else {
 *   setSessionClient(result.sessionClient);
 * }
 * ```
 */
export async function authenticateAsAccountOwner(
	accountAddress: string,
	walletAddress: string,
	appAddress: string,
	walletClient: WalletClient,
): Promise<AuthenticationResult> {
	try {
		console.log("[AuthenticateAccountOwner] Authenticating account:", accountAddress);

		const authenticated = await lensClient.login({
			accountOwner: {
				account: evmAddress(accountAddress as EvmAddress),
				app: evmAddress(appAddress as EvmAddress),
				owner: evmAddress(walletAddress as EvmAddress),
			},
			signMessage: signMessageWith(walletClient),
		});

		if (authenticated.isErr()) {
			const error = new Error(
				`Authentication failed: ${authenticated.error.message || "Unknown error"}`,
			);
			console.error("[AuthenticateAccountOwner] Error:", error);
			return { error };
		}

		console.log("[AuthenticateAccountOwner] Authentication successful");
		return { sessionClient: authenticated.value };
	} catch (err) {
		const error =
			err instanceof Error ? err : new Error("Authentication failed");
		console.error("[AuthenticateAccountOwner] Error:", error);
		return { error };
	}
}
