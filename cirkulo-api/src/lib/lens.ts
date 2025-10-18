import { evmAddress, mainnet, PublicClient } from "@lens-protocol/client";
import { fetchAccount } from "@lens-protocol/client/actions";

// Initialize Lens Protocol client with mainnet
export const lensClient = PublicClient.create({
	environment: mainnet,
});

/**
 * Fetch a Lens account by address
 * @param address - Ethereum address (0x...)
 * @returns Account object with username or null if not found
 */
export async function getLensAccount(address: string) {
	try {
		const result = await fetchAccount(lensClient, {
			address: evmAddress(address),
		});

		if (result.isErr()) {
			console.error("Error fetching Lens account:", result.error);
			return null;
		}

		return result.value;
	} catch (error) {
		console.error("Exception fetching Lens account:", error);
		return null;
	}
}

/**
 * Get username from Lens account address
 * @param address - Ethereum address (0x...)
 * @returns Username string or null if account not found
 */
export async function getLensUsername(address: string): Promise<string | null> {
	const account = await getLensAccount(address);

	if (!account || !account.username) {
		return null;
	}

	return `@${account.username.localName}`;
}
