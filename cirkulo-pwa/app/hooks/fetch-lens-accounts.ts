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
	lensAccount: LensAccount | undefined;
	isLoading: boolean;
	error: Error | null;
}

/**
 * Custom hook to fetch Lens Protocol account for a given wallet address
 *
 * @param walletAddress - The wallet address to check for Lens accounts
 * @returns Object containing lensAccount, isLoading, and error states
 *
 * @example
 * const { lensAccount, isLoading, error } = useFetchLensAccounts(wallet?.address);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * if (lensAccount) return <Profile account={lensAccount} />;
 */
export function useFetchLensAccounts(
	walletAddress: string | undefined,
): UseFetchLensAccountsReturn {
	const [lensAccount, setLensAccount] = useState<LensAccount | undefined>(
		undefined,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		// Early return if no wallet address
		if (!walletAddress) {
			setLensAccount(undefined);
			setIsLoading(false);
			setError(null);
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
					const accountManaged = result.value.items[0];
					const account = accountManaged.account;

					setLensAccount({
						address: account.address,
						username: account.username?.localName || account.address,
						metadata: account.metadata
							? {
									name: account.metadata.name || undefined,
									bio: account.metadata.bio || undefined,
									picture: account.metadata.picture || undefined,
								}
							: undefined,
					});
				} else {
					setLensAccount(undefined);
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err
						: new Error("Failed to fetch Lens account");
				console.error("Error fetching Lens account:", errorMessage);
				setError(errorMessage);
				setLensAccount(undefined);
			} finally {
				setIsLoading(false);
			}
		};

		fetchLensAccount();
	}, [walletAddress]);

	return { lensAccount, isLoading, error };
}
