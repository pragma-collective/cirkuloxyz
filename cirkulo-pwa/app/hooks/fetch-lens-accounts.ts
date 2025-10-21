import { useEffect, useState } from "react";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { lensClient } from "app/lib/lens";

/**
 * Lens account interface
 * Represents a Lens Protocol account with metadata
 */
export interface LensAccount {
	address: string;
	username: string;
	metadata?: {
		name?: string;
		bio?: string;
		picture?: string;
	};
}

/**
 * Return type for useFetchLensAccounts hook
 */
export interface UseFetchLensAccountsReturn {
	lensAccounts: LensAccount[];
	isLoading: boolean;
	error: Error | null;
}

/**
 * Custom hook to fetch all Lens Protocol accounts for a given wallet address
 *
 * @param walletAddress - The wallet address to check for Lens accounts
 * @returns Object containing lensAccounts array, isLoading, and error states
 *
 * @example
 * const { lensAccounts, isLoading, error } = useFetchLensAccounts(wallet?.address);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * if (lensAccounts.length > 0) return <AccountList accounts={lensAccounts} />;
 */
export function useFetchLensAccounts(
	walletAddress: string | undefined,
): UseFetchLensAccountsReturn {
	const [lensAccounts, setLensAccounts] = useState<LensAccount[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		// Early return if no wallet address
		if (!walletAddress) {
			return;
		}

		const fetchLensAccount = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const result = await fetchAccountsAvailable(lensClient, {
					managedBy: evmAddress(walletAddress),
					includeOwned: true,
				});

				if (result.isOk() && result.value.items.length > 0) {
					// Map all accounts instead of just the first one
					const accounts = result.value.items.map((accountManaged) => {
						const account = accountManaged.account;

						return {
							address: account.address,
							username: account.username?.localName || account.address,
							metadata: account.metadata
								? {
										name: account.metadata.name || undefined,
										bio: account.metadata.bio || undefined,
										picture: account.metadata.picture || undefined,
									}
								: undefined,
						};
					});

					setLensAccounts(accounts);
					setIsLoading(false);
				} else {
					setLensAccounts([]);
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err
						: new Error("Failed to fetch Lens accounts");
				console.error("Error fetching Lens accounts:", errorMessage);
				setError(errorMessage);
				setLensAccounts([]);
				setIsLoading(false);
			} finally {
			}
		};

		fetchLensAccount();
	}, [walletAddress]);

	return { lensAccounts, isLoading, error };
}
