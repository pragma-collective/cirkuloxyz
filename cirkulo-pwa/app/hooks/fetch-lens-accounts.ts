import { useEffect, useState, useRef } from "react";
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
	hasFetched: boolean;
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
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [hasFetched, setHasFetched] = useState(false);

	// Track previous wallet address VALUE to prevent unnecessary re-fetching
	const previousAddressRef = useRef<string | undefined>(undefined);
	const hasFetchedRef = useRef(false);

	// Cache the accounts array to return the same reference if unchanged
	const accountsCacheRef = useRef<LensAccount[]>([]);

	useEffect(() => {
		// Check if wallet address VALUE has actually changed
		// This prevents re-fetching when only the reference changes during navigation
		if (previousAddressRef.current === walletAddress && hasFetchedRef.current) {
			// Address value hasn't changed and we've already fetched, skip fetching
			console.log("[useFetchLensAccounts] Skipping fetch - address unchanged:", walletAddress?.slice(0, 6));
			return;
		}

		// Update the previous address ref
		previousAddressRef.current = walletAddress;

		// Early return if no wallet address
		if (!walletAddress) {
			console.log("[useFetchLensAccounts] No wallet address, clearing state");
			setIsLoading(false);
			setLensAccounts([]);
			setError(null);
			setHasFetched(false);
			hasFetchedRef.current = false;
			return;
		}

		const fetchLensAccount = async () => {
			console.log("[useFetchLensAccounts] Starting fetch for:", walletAddress.slice(0, 6));

			// Only set loading state when we're ACTUALLY fetching
			// This prevents false loading states during navigation
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

					// Only update if accounts actually changed
					accountsCacheRef.current = accounts;
					setLensAccounts(accounts);
					console.log("[useFetchLensAccounts] Fetch complete, found", accounts.length, "accounts");
					setIsLoading(false);
					setHasFetched(true);
					hasFetchedRef.current = true;
				} else {
					// No accounts found - not an error, just empty result
					const emptyArray = accountsCacheRef.current.length === 0 ? accountsCacheRef.current : [];
					accountsCacheRef.current = emptyArray;
					setLensAccounts(emptyArray);
					console.log("[useFetchLensAccounts] Fetch complete, no accounts found");
					setIsLoading(false);
					setHasFetched(true);
					hasFetchedRef.current = true;
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
				setHasFetched(true);  // Mark as fetched even on error
			}
		};

		fetchLensAccount();
	}, [walletAddress]);

	return { lensAccounts, isLoading, error, hasFetched };
}
