import { ethers } from "ethers";

/**
 * Blockchain Service for InviteOnlyGroupRule contract interaction
 *
 * This service handles on-chain invite registration using the backend signer wallet.
 * Registration happens when user accepts invite (not when invite is sent).
 */

// Initialize Lens Chain provider
const provider = new ethers.JsonRpcProvider(
	process.env.LENS_CHAIN_RPC_URL || "https://rpc.testnet.lens.xyz",
);

// Create backend signer from private key
const backendSigner = new ethers.Wallet(
	process.env.BACKEND_SIGNER_PRIVATE_KEY || "",
	provider,
);

// Contract ABI - only the functions we need
const INVITE_RULE_ABI = [
	{
		inputs: [
			{ internalType: "bytes32", name: "configSalt", type: "bytes32" },
			{ internalType: "address", name: "inviter", type: "address" },
			{ internalType: "bytes32", name: "inviteCodeHash", type: "bytes32" },
			{ internalType: "uint256", name: "expiresAt", type: "uint256" },
		],
		name: "registerInvite",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "configSalt", type: "bytes32" },
			{ internalType: "bytes32", name: "inviteCodeHash", type: "bytes32" },
		],
		name: "cancelInvite",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "configSalt",
				type: "bytes32",
			},
			{
				indexed: true,
				internalType: "address",
				name: "inviter",
				type: "address",
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "inviteCodeHash",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "expiresAt",
				type: "uint256",
			},
		],
		name: "InviteRegistered",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "configSalt",
				type: "bytes32",
			},
			{
				indexed: true,
				internalType: "address",
				name: "inviter",
				type: "address",
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "inviteCodeHash",
				type: "bytes32",
			},
		],
		name: "InviteCancelled",
		type: "event",
	},
];

// Initialize contract instance
let ruleContract: ethers.Contract | null = null;

function getRuleContract(): ethers.Contract {
	if (!ruleContract) {
		const contractAddress = process.env.INVITE_RULE_CONTRACT_ADDRESS;

		if (!contractAddress) {
			throw new Error("INVITE_RULE_CONTRACT_ADDRESS not set in environment");
		}

		if (!process.env.BACKEND_SIGNER_PRIVATE_KEY) {
			throw new Error("BACKEND_SIGNER_PRIVATE_KEY not set in environment");
		}

		ruleContract = new ethers.Contract(
			contractAddress,
			INVITE_RULE_ABI,
			backendSigner,
		);
	}

	return ruleContract;
}

export interface RegisterInviteParams {
	configSalt: string;
	senderAddress: string;
	inviteCode: string;
	expiresAt: Date;
}

/**
 * Register an invite on-chain
 *
 * Called when invite is sent by a group member.
 * Uses sender's address to register the invite code on-chain.
 *
 * @param params - Invite registration parameters
 * @returns Transaction hash
 * @throws Error if registration fails
 */
export async function registerInvite(
	params: RegisterInviteParams,
): Promise<string> {
	try {
		const contract = getRuleContract();

		console.log("📝 Registering invite on-chain:", {
			configSalt: params.configSalt,
			configSaltType: typeof params.configSalt,
			sender: params.senderAddress,
			expiresAt: params.expiresAt.toISOString(),
		});

		// Parse configSalt - it might be a Base64 JSON string or hex string
		let processedConfigSalt: string;

		try {
			// Check if it's a Base64 JSON string
			if (!params.configSalt.startsWith("0x")) {
				// Decode Base64 and parse JSON
				const decoded = Buffer.from(params.configSalt, "base64").toString(
					"utf-8",
				);
				console.log("📝 Decoded configSalt:", decoded);

				const parsed = JSON.parse(decoded);
				processedConfigSalt = parsed.config_salt || parsed.configSalt;
				console.log("📝 Extracted configSalt from JSON:", processedConfigSalt);
			} else {
				// Already in hex format
				processedConfigSalt = params.configSalt;
			}
		} catch (_parseError) {
			console.log(
				"📝 ConfigSalt parsing failed, using as-is:",
				params.configSalt,
			);
			processedConfigSalt = params.configSalt;
		}

		// Ensure it's a valid bytes32 hex string
		if (!processedConfigSalt.startsWith("0x")) {
			processedConfigSalt = `0x${processedConfigSalt}`;
		}

		// Pad to 32 bytes if needed
		if (processedConfigSalt.length < 66) {
			// 0x + 64 hex chars = 66
			processedConfigSalt = processedConfigSalt.padEnd(66, "0");
		}

		console.log("📝 Final configSalt for contract:", processedConfigSalt);

		// Hash the invite code for privacy (never store plain code on-chain)
		const inviteCodeHash = ethers.keccak256(
			ethers.toUtf8Bytes(params.inviteCode),
		);

		// Convert expiration date to Unix timestamp
		const expiresAtTimestamp = Math.floor(params.expiresAt.getTime() / 1000);

		console.log("Registration payload: ", {
			processedConfigSalt,
			senderAddress: params.senderAddress,
			inviteCodeHash,
			expiresAtTimestamp,
		});

		// Call smart contract to register invite
		const tx = await contract.registerInvite(
			processedConfigSalt,
			params.senderAddress,
			inviteCodeHash,
			expiresAtTimestamp,
		);

		console.log("⏳ Transaction sent, waiting for confirmation:", tx.hash);

		// Wait for transaction to be mined
		const receipt = await tx.wait();

		console.log("✅ Invite registered on-chain:", {
			txHash: receipt.hash,
			blockNumber: receipt.blockNumber,
			gasUsed: receipt.gasUsed.toString(),
		});

		return receipt.hash;
	} catch (error) {
		console.error("❌ Failed to register invite on-chain:", error);

		// Provide more helpful error messages
		if (error instanceof Error) {
			if (error.message.includes("OnlyBackend")) {
				throw new Error("Backend signer not authorized for this contract");
			}
			if (error.message.includes("InviteExpired")) {
				throw new Error("Invite expiration date is in the past");
			}
			if (error.message.includes("InvalidAddress")) {
				throw new Error("Invalid invitee address");
			}
			throw new Error(`Failed to register invite: ${error.message}`);
		}

		throw new Error("Failed to register invite on blockchain");
	}
}

export interface CancelInviteParams {
	configSalt: string;
	inviteCode: string;
}

/**
 * Cancel an invite on-chain and free storage
 *
 * Called when a group owner cancels a pending invite.
 * Deletes the invite data from the contract, reclaiming gas.
 *
 * @param params - Invite cancellation parameters
 * @throws Error if cancellation fails
 */
export async function cancelInviteOnChain(
	params: CancelInviteParams,
): Promise<void> {
	try {
		const contract = getRuleContract();

		console.log("🔗 Cancelling invite on-chain:", {
			configSalt: params.configSalt,
			configSaltType: typeof params.configSalt,
		});

		// Parse configSalt - same logic as registerInvite
		let processedConfigSalt: string;

		try {
			// Check if it's a Base64 JSON string
			if (!params.configSalt.startsWith("0x")) {
				// Decode Base64 and parse JSON
				const decoded = Buffer.from(params.configSalt, "base64").toString(
					"utf-8",
				);
				console.log("📝 Decoded configSalt:", decoded);

				const parsed = JSON.parse(decoded);
				processedConfigSalt = parsed.config_salt || parsed.configSalt;
				console.log("📝 Extracted configSalt from JSON:", processedConfigSalt);
			} else {
				// Already in hex format
				processedConfigSalt = params.configSalt;
			}
		} catch (_parseError) {
			console.log(
				"📝 ConfigSalt parsing failed, using as-is:",
				params.configSalt,
			);
			processedConfigSalt = params.configSalt;
		}

		// Ensure it's a valid bytes32 hex string
		if (!processedConfigSalt.startsWith("0x")) {
			processedConfigSalt = `0x${processedConfigSalt}`;
		}

		// Pad to 32 bytes if needed
		if (processedConfigSalt.length < 66) {
			// 0x + 64 hex chars = 66
			processedConfigSalt = processedConfigSalt.padEnd(66, "0");
		}

		console.log("📝 Final configSalt for contract:", processedConfigSalt);

		// Hash the invite code (same as registration)
		const inviteCodeHash = ethers.keccak256(
			ethers.toUtf8Bytes(params.inviteCode),
		);

		console.log("Cancellation payload:", {
			processedConfigSalt,
			inviteCodeHash,
		});

		// Call smart contract to cancel invite
		const tx = await contract.cancelInvite(processedConfigSalt, inviteCodeHash);

		console.log("⏳ Transaction sent, waiting for confirmation:", tx.hash);

		// Wait for transaction to be mined
		const receipt = await tx.wait();

		console.log("✅ Invite cancelled on-chain:", {
			txHash: receipt.hash,
			blockNumber: receipt.blockNumber,
			gasUsed: receipt.gasUsed.toString(),
		});
	} catch (error) {
		console.error("❌ Failed to cancel invite on-chain:", error);

		// Provide more helpful error messages
		if (error instanceof Error) {
			if (error.message.includes("OnlyBackend")) {
				throw new Error("Backend signer not authorized for this contract");
			}
			if (error.message.includes("InviteNotFound")) {
				throw new Error(
					"Invite not found or already cancelled on the blockchain",
				);
			}
			if (error.message.includes("InviteNotCancellable")) {
				throw new Error(
					"Cannot cancel invite that has already been used by a member",
				);
			}
			throw new Error(`Failed to cancel invite: ${error.message}`);
		}

		throw new Error("Failed to cancel invite on blockchain");
	}
}

/**
 * Get the backend signer address
 * @returns Backend signer Ethereum address
 */
export function getBackendAddress(): string {
	return backendSigner.address;
}

/**
 * Check backend signer balance
 * @returns Balance in GRASS tokens (formatted as string)
 */
export async function getBackendBalance(): Promise<string> {
	try {
		const balance = await provider.getBalance(backendSigner.address);
		return ethers.formatEther(balance);
	} catch (error) {
		console.error("Failed to get backend balance:", error);
		return "0";
	}
}
