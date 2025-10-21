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
			{ internalType: "address", name: "invitee", type: "address" },
			{ internalType: "bytes32", name: "inviteCodeHash", type: "bytes32" },
			{ internalType: "uint256", name: "expiresAt", type: "uint256" },
		],
		name: "registerInvite",
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
				name: "invitee",
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
	inviteeAddress: string;
	inviteCode: string;
	expiresAt: Date;
}

/**
 * Register an invite on-chain
 *
 * Called when user accepts invite and provides wallet address.
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
			invitee: params.inviteeAddress,
			expiresAt: params.expiresAt.toISOString(),
		});

		// Hash the invite code for privacy (never store plain code on-chain)
		const inviteCodeHash = ethers.keccak256(
			ethers.toUtf8Bytes(params.inviteCode),
		);

		// Convert expiration date to Unix timestamp
		const expiresAtTimestamp = Math.floor(params.expiresAt.getTime() / 1000);

		// Call smart contract to register invite
		const tx = await contract.registerInvite(
			params.configSalt,
			params.inviteeAddress,
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
