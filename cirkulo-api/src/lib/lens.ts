import {
	evmAddress,
	mainnet,
	PublicClient,
	testnet,
} from "@lens-protocol/client";
import { fetchAccount } from "@lens-protocol/client/actions";

// Determine Lens environment based on LENS_ENVIRONMENT variable
// Use 'production' for mainnet, anything else defaults to testnet
const getLensEnvironment = () => {
	const lensEnv = process.env.LENS_ENVIRONMENT?.toLowerCase();
	return lensEnv === "production" ? mainnet : testnet;
};

/**
 * Get JWKS URI based on LENS_ENVIRONMENT
 * @returns JWKS URI for the appropriate Lens environment
 */
export const getJwksUri = () => {
	const lensEnv = process.env.LENS_ENVIRONMENT?.toLowerCase();
	return lensEnv === "production"
		? "https://api.lens.xyz/.well-known/jwks.json"
		: "https://api.testnet.lens.xyz/.well-known/jwks.json";
};

// Initialize Lens Protocol client with appropriate environment
export const lensClient = PublicClient.create({
	environment: getLensEnvironment(),
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
