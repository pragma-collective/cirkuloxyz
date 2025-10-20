import { useState, useCallback } from "react";
import {
	evmAddress,
	uri,
	type EvmAddress,
	type SessionClient,
} from "@lens-protocol/client";
import { signMessageWith } from "@lens-protocol/client/viem";
import {
	canCreateUsername,
	createAccountWithUsername,
	fetchAccount,
} from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { lensClient } from "app/lib/lens";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { WalletClient } from "viem";

// Re-export SessionClient for use in other files
export type { SessionClient };

/**
 * Result of authentication as onboarding user
 */
export interface AuthenticationResult {
	/** Authenticated Lens session client */
	sessionClient?: SessionClient;
	/** Error if authentication failed */
	error?: Error;
}

/**
 * Parameters for creating a Lens Protocol account
 */
export interface CreateAccountParams {
	/** Username for lens/ namespace (localName only, e.g., "alice") */
	username: string;
	/** lens:// URI from Lens Storage containing account metadata */
	metadataUri: string;
	/** User's wallet address */
	walletAddress: string;
	/** App's Lens address for onboarding authentication */
	appAddress: string;
	/** Optional: Existing session client to skip authentication */
	sessionClient?: SessionClient;
}

/**
 * Result of account creation operation
 */
export interface CreateAccountResult {
	/** Transaction hash of the account creation */
	txHash?: string;
	/** Address of the newly created Lens account */
	accountAddress?: string;
	/** Error if account creation failed */
	error?: Error;
}

/**
 * Result of username availability check
 */
export interface UsernameAvailability {
	/** Whether the username is available */
	available: boolean;
	/** Reason if username is not available */
	reason?: string;
	/** Error if validation check failed */
	error?: Error;
}

/**
 * Return type for useCreateLensAccount hook
 */
export interface UseCreateLensAccountReturn {
	/** Create a new Lens account with username */
	createAccount: (params: CreateAccountParams) => Promise<CreateAccountResult>;
	/** Whether account creation is in progress */
	isCreating: boolean;
	/** Error from most recent account creation attempt */
	error: Error | null;
}

/**
 * Authenticate as an onboarding user with Lens Protocol
 *
 * This should be called when the onboarding page loads to establish
 * a session for the user before they submit the form. This enables
 * real-time username validation and faster form submission.
 *
 * @param walletAddress - User's wallet address
 * @param appAddress - App's Lens address for onboarding
 * @param walletClient - Viem wallet client from Dynamic
 * @returns Promise with sessionClient on success or error on failure
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const authenticate = async () => {
 *     const walletClient = await primaryWallet.getWalletClient();
 *     const result = await authenticateAsOnboardingUser(
 *       primaryWallet.address,
 *       APP_ADDRESS,
 *       walletClient
 *     );
 *
 *     if (result.sessionClient) {
 *       setSessionClient(result.sessionClient);
 *     } else {
 *       console.error("Auth failed:", result.error);
 *     }
 *   };
 *
 *   authenticate();
 * }, [primaryWallet]);
 * ```
 */
export async function authenticateAsOnboardingUser(
	walletAddress: string,
	appAddress: string,
	walletClient: WalletClient,
): Promise<AuthenticationResult> {
	try {
		console.log("[AuthenticateOnboarding] Authenticating wallet:", walletAddress);

		const authenticated = await lensClient.login({
			onboardingUser: {
				app: evmAddress(appAddress as EvmAddress),
				wallet: evmAddress(walletAddress as EvmAddress),
			},
			signMessage: signMessageWith(walletClient),
		});

		if (authenticated.isErr()) {
			const error = new Error(
				`Authentication failed: ${authenticated.error.message || "Unknown error"}`,
			);
			console.error("[AuthenticateOnboarding] Error:", error);
			return { error };
		}

		console.log("[AuthenticateOnboarding] Authentication successful");
		return { sessionClient: authenticated.value };
	} catch (err) {
		const error =
			err instanceof Error ? err : new Error("Authentication failed");
		console.error("[AuthenticateOnboarding] Error:", error);
		return { error };
	}
}

/**
 * Check if a username is available for registration
 *
 * This function requires an existing authenticated session client and is
 * optimized for real-time validation (e.g., on input blur). Use this when
 * you've already authenticated via `authenticateAsOnboardingUser()`.
 *
 * @param username - The username to check (localName only, e.g., "alice")
 * @param sessionClient - Authenticated Lens session client
 * @returns Promise with availability status
 *
 * @example
 * ```tsx
 * const handleUsernameBlur = async (username: string) => {
 *   if (!sessionClient) return;
 *
 *   const availability = await checkUsername(username, sessionClient);
 *
 *   if (availability.available) {
 *     setUsernameStatus("Available!");
 *   } else {
 *     setUsernameStatus(availability.reason || "Not available");
 *   }
 * };
 * ```
 */
export async function checkUsername(
	username: string,
	sessionClient: SessionClient,
): Promise<UsernameAvailability> {
	try {
		// Validate input
		if (!username || username.trim().length === 0) {
			return {
				available: false,
				reason: "Username cannot be empty",
			};
		}

		console.log("[CheckUsername] Validating username:", username);

		// Check username availability
		const result = await canCreateUsername(sessionClient, {
			localName: username.trim(),
		});

		if (result.isErr()) {
			const error = new Error(`Validation failed: ${result.error.message}`);
			console.error("[CheckUsername] Error:", error);
			return { available: false, error };
		}

		const validation = result.value;

		// Handle different validation result types
		if (validation.__typename === "NamespaceOperationValidationPassed") {
			console.log("[CheckUsername] Username is available");
			return { available: true };
		}

		if (validation.__typename === "NamespaceOperationValidationFailed") {
			console.log("[CheckUsername] Username validation failed");
			return {
				available: false,
				reason:
					"Username not available. It may be taken, invalid, or not satisfy namespace rules.",
			};
		}

		if (validation.__typename === "UsernameTaken") {
			console.log("[CheckUsername] Username is taken");
			return {
				available: false,
				reason: "This username is already taken",
			};
		}

		if (validation.__typename === "NamespaceOperationValidationUnknown") {
			console.warn(
				"[CheckUsername] Username validation requires additional checks:",
				validation,
			);
			return {
				available: false,
				reason: "Username validation requires additional checks",
			};
		}

		// Fallback for any unexpected validation result types
		return {
			available: false,
			reason: `Validation failed: ${(validation as any).__typename || "Unknown"}`,
		};
	} catch (err) {
		const error =
			err instanceof Error ? err : new Error("Unknown validation error");
		console.error("[CheckUsername] Error:", error);
		return { available: false, error };
	}
}

/**
 * Custom hook for creating Lens Protocol accounts
 *
 * This hook handles the complete onboarding flow:
 * 1. Authenticates as onboarding user with the connected wallet
 * 2. Validates username availability
 * 3. Creates account with username
 * 4. Waits for transaction confirmation
 * 5. Switches to account owner role
 *
 * @returns Object with createAccount function, loading state, and error state
 *
 * @example
 * ```tsx
 * const { createAccount, isCreating, error } = useCreateLensAccount();
 *
 * const handleSubmit = async () => {
 *   const result = await createAccount({
 *     username: "alice",
 *     metadataUri: "lens://4f91cab87ab5e4f5066f878b72...",
 *     walletAddress: "0x1234...",
 *     appAddress: "0x5678..."
 *   });
 *
 *   if (result.error) {
 *     console.error("Account creation failed:", result.error);
 *   } else {
 *     console.log("Account created:", result.accountAddress);
 *   }
 * };
 * ```
 */
export function useCreateLensAccount(): UseCreateLensAccountReturn {
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const { primaryWallet } = useDynamicContext();

	/**
	 * Create a new Lens Protocol account with username
	 *
	 * This function performs the complete account creation flow including:
	 * - Authentication as onboarding user
	 * - Username validation
	 * - Account creation transaction
	 * - Waiting for confirmation
	 * - Switching to account owner role
	 */
	const createAccount = useCallback(
		async (params: CreateAccountParams): Promise<CreateAccountResult> => {
			setIsCreating(true);
			setError(null);

			try {
				// Validate parameters
				if (!params.username || params.username.trim().length === 0) {
					throw new Error("Username is required");
				}
				if (!params.metadataUri || !params.metadataUri.startsWith("lens://")) {
					throw new Error("Valid metadata URI is required (must start with lens://)");
				}
				if (!params.walletAddress) {
					throw new Error("Wallet address is required");
				}
				if (!params.appAddress) {
					throw new Error("App address is required");
				}

				console.log("[CreateLensAccount] Starting account creation:", {
					username: params.username,
					walletAddress: params.walletAddress,
					appAddress: params.appAddress,
				});

				// Step 1: Authenticate as onboarding user (or use existing session)
				let sessionClient: SessionClient;

				if (params.sessionClient) {
					// Use provided session client (already authenticated)
					console.log("[CreateLensAccount] Using existing session client");
					sessionClient = params.sessionClient;
				} else {
					// Authenticate as onboarding user
					console.log(
						"[CreateLensAccount] Step 1: Authenticating as onboarding user...",
					);

					if (!primaryWallet) {
						throw new Error("No wallet connected. Please connect a wallet first.");
					}

					// @ts-expect-error - getWalletClient exists at runtime but not in type definition
					const walletClient = await primaryWallet.getWalletClient();
					const authResult = await authenticateAsOnboardingUser(
						params.walletAddress,
						params.appAddress,
						walletClient,
					);

					if (authResult.error || !authResult.sessionClient) {
						throw authResult.error || new Error("Authentication failed");
					}

					sessionClient = authResult.sessionClient;
					console.log("[CreateLensAccount] Authentication successful");
				}

				// Step 2: Validate username availability
				console.log(
					"[CreateLensAccount] Step 2: Validating username availability...",
				);
				const availability = await checkUsername(
					params.username.trim(),
					sessionClient,
				);

				if (!availability.available) {
					throw new Error(
						availability.reason ||
							`Username "${params.username}" is not available`,
					);
				}

				console.log("[CreateLensAccount] Username is available");

				// Step 3: Create account with username
				console.log("[CreateLensAccount] Step 3: Creating account...");

				// Get wallet client for transaction signing
				if (!primaryWallet) {
					throw new Error("No wallet connected for transaction signing");
				}
				// @ts-expect-error - getWalletClient exists at runtime but not in type definition
				const walletClient = await primaryWallet.getWalletClient();

				const createResult = await createAccountWithUsername(sessionClient, {
					username: { localName: params.username.trim() },
					metadataUri: uri(params.metadataUri),
				})
					.andThen(handleOperationWith(walletClient))
					.andThen(sessionClient.waitForTransaction);

				if (createResult.isErr()) {
					throw new Error(
						`Account creation failed: ${createResult.error.message || "Unknown error"}`,
					);
				}

				const txHash = createResult.value;
				console.log("[CreateLensAccount] Account created, transaction:", txHash);

				// Step 4: Fetch the newly created account
				console.log("[CreateLensAccount] Step 4: Fetching created account...");
				const accountResult = await fetchAccount(sessionClient, { txHash });

				if (accountResult.isErr()) {
					throw new Error(
						`Failed to fetch created account: ${accountResult.error.message || "Unknown error"}`,
					);
				}

				const account = accountResult.value;

				if (!account) {
					throw new Error(
						"Account creation succeeded but account not found. This may indicate a timing issue.",
					);
				}

				const accountAddress = account.address;
				console.log(
					"[CreateLensAccount] Account fetched successfully:",
					accountAddress,
				);

				// Step 5: Switch to account owner role
				console.log("[CreateLensAccount] Step 5: Switching to account owner...");
				const switchResult = await sessionClient.switchAccount({
					account: accountAddress,
				});

				if (switchResult.isErr()) {
					// Log the error but don't fail the entire operation
					// The account was created successfully, switching is optional
					console.error(
						"[CreateLensAccount] Warning: Failed to switch to account owner:",
						switchResult.error,
					);
				} else {
					console.log("[CreateLensAccount] Switched to account owner");
				}

				console.log("[CreateLensAccount] Account creation complete:", {
					txHash,
					accountAddress,
					username: params.username,
				});

				return {
					txHash,
					accountAddress,
				};
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err : new Error("Failed to create Lens account");
				console.error("[CreateLensAccount] Error:", errorMessage);
				setError(errorMessage);

				return {
					error: errorMessage,
				};
			} finally {
				setIsCreating(false);
			}
		},
		[primaryWallet],
	);

	return {
		createAccount,
		isCreating,
		error,
	};
}

