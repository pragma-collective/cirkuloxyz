import { evmAddress, PublicClient, testnet } from "@lens-protocol/client";
import {
	fetchAccount,
	fetchGroupMembers,
	fetchGroup as lensProtocolFetchGroup,
} from "@lens-protocol/client/actions";

/**
 * Get JWKS URI for Lens testnet
 * @returns JWKS URI for Lens testnet
 */
export const getJwksUri = () => {
	return "https://api.testnet.lens.xyz/.well-known/jwks.json";
};

// Initialize Lens Protocol client for testnet
export const lensClient = PublicClient.create({
	environment: testnet,
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

/**
 * Check if an address is a member of a group
 * @param groupAddress - The group's address
 * @param memberAddress - The address to check
 * @returns true if the address is a member
 */
export async function isGroupMember(
	groupAddress: string,
	memberAddress: string,
): Promise<boolean> {
	try {
		console.log(
			`📡 Checking if ${memberAddress} is member of group ${groupAddress}`,
		);

		const result = await fetchGroupMembers(lensClient, {
			group: evmAddress(groupAddress),
		});

		if (result.isErr()) {
			console.error(
				"Error fetching group members from Lens Protocol:",
				result.error,
			);
			// For security: if we can't verify, deny access
			return false;
		}

		const members = result.value.items;
		console.log("here: ", members, memberAddress);

		// Check if memberAddress is in the list of members
		const isMember = members.some(
			(member) =>
				member.account.address.toLowerCase() === memberAddress.toLowerCase(),
		);

		console.log(`${isMember ? "✅" : "❌"} Member check result: ${isMember}`);

		return isMember;
	} catch (error) {
		console.error("Error checking group membership:", error);
		// For security: if we can't verify, deny access
		return false;
	}
}

/**
 * Fetch group details from Lens Protocol
 * @param groupAddress - The group's address
 * @returns Group details including configSalt and owner
 */
export async function fetchGroup(groupAddress: string): Promise<{
	address: string;
	configSalt: string;
	owner: string;
	name?: string;
	description?: string;
}> {
	try {
		console.log(`📡 Fetching group details for ${groupAddress}`);

		const result = await lensProtocolFetchGroup(lensClient, {
			group: evmAddress(groupAddress),
		});

		if (result.isErr()) {
			console.error("Error fetching group from Lens Protocol:", result.error);
			throw new Error(`Failed to fetch group: ${JSON.stringify(result.error)}`);
		}

		const group = result.value;

		if (!group) {
			throw new Error("Group not found");
		}

		// Extract configSalt from the first required rule
		// According to Lens Protocol docs: group.rules.required[0].id is the configSalt
		const rawConfigSalt = group.rules?.required?.[0]?.id || groupAddress;

		console.log(`📝 Raw configSalt from Lens:`, {
			rawConfigSalt,
			type: typeof rawConfigSalt,
			isString: typeof rawConfigSalt === "string",
			startsWithHex:
				typeof rawConfigSalt === "string" && rawConfigSalt.startsWith("0x"),
		});

		// The configSalt might be in different formats from Lens Protocol
		let configSalt: string;

		if (typeof rawConfigSalt === "string") {
			if (rawConfigSalt.startsWith("0x")) {
				// Already a hex string
				configSalt = rawConfigSalt;
			} else {
				// Check if it's a Base64 encoded JSON or just use as-is
				try {
					// Try to decode as Base64 if it looks like one
					if (rawConfigSalt.length > 20 && !rawConfigSalt.includes(" ")) {
						const decoded = Buffer.from(rawConfigSalt, "base64").toString(
							"utf-8",
						);
						const parsed = JSON.parse(decoded);
						configSalt =
							parsed.config_salt || parsed.configSalt || rawConfigSalt;
					} else {
						configSalt = rawConfigSalt;
					}
				} catch {
					// Not Base64 JSON, use as-is
					configSalt = rawConfigSalt;
				}
			}
		} else {
			// Convert to string if it's not already
			configSalt = String(rawConfigSalt);
		}

		console.log(`✅ Fetched group: ${group.metadata?.name || "Unknown"}`);
		console.log(`📝 Final ConfigSalt: ${configSalt}`);

		return {
			address: group.address,
			configSalt,
			owner: group.owner,
			name: group.metadata?.name || undefined,
			description: group.metadata?.description || undefined,
		};
	} catch (error) {
		console.error("Error fetching group:", error);

		// Fallback: throw error as we need the owner information
		throw error;
	}
}

/**
 * Check if an address is the owner of a group
 * @param groupAddress - The group's address
 * @param userAddress - The address to check
 * @returns true if the address is the owner
 */
export async function isGroupOwner(
	groupAddress: string,
	userAddress: string,
): Promise<boolean> {
	try {
		console.log(
			`📡 Checking if ${userAddress} is owner of group ${groupAddress}`,
		);

		const group = await fetchGroup(groupAddress);

		const isOwner = group.owner.toLowerCase() === userAddress.toLowerCase();

		console.log(`${isOwner ? "✅" : "❌"} Owner check result: ${isOwner}`);

		return isOwner;
	} catch (error) {
		console.error("Error checking group ownership:", error);
		// For security: if we can't verify, deny access
		return false;
	}
}
