import { ethers } from "ethers";

/**
 * On-ramp Service for funding user wallets with CBTC and CUSD
 *
 * This service handles transferring CBTC and CUSD tokens from the backend wallet to user wallets
 * on Citrea testnet. Used for the testnet faucet/on-ramp feature.
 */

// Initialize Citrea RPC provider
const citreaProvider = new ethers.JsonRpcProvider(
	process.env.CITREA_RPC_URL || "https://rpc.testnet.citrea.xyz",
);

/**
 * CUSD Token Contract Address on Citrea Testnet
 */
const CUSD_TOKEN_ADDRESS = "0x832C7a2F1449C62C1b40b4CC56De65d8458A3a1f";

/**
 * Default amount to send: 0.0001 CBTC (in wei)
 */
const DEFAULT_CBTC_AMOUNT = ethers.parseEther("0.0001");

/**
 * Default amount to send: 50 CUSD (assuming 18 decimals)
 */
const DEFAULT_CUSD_AMOUNT = ethers.parseUnits("50", 18);

/**
 * Minimum balance required in faucet wallet (0.05 CBTC)
 */
const MIN_FAUCET_BALANCE = ethers.parseEther("0.05");

/**
 * ERC20 Token ABI - only the functions we need
 */
const ERC20_ABI = [
	"function transfer(address to, uint256 amount) returns (bool)",
	"function balanceOf(address account) view returns (uint256)",
	"function decimals() view returns (uint8)",
	"function symbol() view returns (string)",
];

/**
 * Lazy initialization of faucet wallet
 * Only creates wallet when needed and validates private key exists
 */
let _faucetWallet: ethers.Wallet | null = null;

function getFaucetWallet(): ethers.Wallet {
	if (_faucetWallet) {
		return _faucetWallet;
	}

	const privateKey = process.env.BACKEND_FAUCET_PRIVATE_KEY;

	if (!privateKey || privateKey.trim() === "") {
		throw new Error(
			"BACKEND_FAUCET_PRIVATE_KEY environment variable is not set. " +
				"Please add it to your .env file to enable the on-ramp feature.",
		);
	}

	try {
		_faucetWallet = new ethers.Wallet(privateKey, citreaProvider);
		console.log(`[Onramp] Faucet wallet initialized: ${_faucetWallet.address}`);
		return _faucetWallet;
	} catch (error) {
		throw new Error(
			`Failed to initialize faucet wallet. Please check that BACKEND_FAUCET_PRIVATE_KEY is a valid private key. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Fund a user wallet with CBTC and CUSD tokens
 *
 * @param recipientAddress - Address to receive the funds
 * @param cbtcAmountWei - Optional custom CBTC amount in wei (defaults to 0.0001 CBTC)
 * @param cusdAmount - Optional custom CUSD amount (defaults to 50 CUSD)
 * @returns Object containing transaction hashes, recipient address, and amounts sent
 * @throws Error if transaction fails, insufficient balance, or invalid address
 */
export async function fundUserWallet(
	recipientAddress: string,
	cbtcAmountWei?: bigint,
	cusdAmount?: bigint,
): Promise<{
	cbtcTransactionHash: string;
	cusdTransactionHash: string;
	recipientAddress: string;
	cbtcAmount: string;
	cusdAmount: string;
}> {
	try {
		// Get faucet wallet (validates configuration)
		const faucetWallet = getFaucetWallet();

		// Validate recipient address
		if (!ethers.isAddress(recipientAddress)) {
			throw new Error(`Invalid recipient address: ${recipientAddress}`);
		}

		// Use provided amounts or defaults
		const cbtcToSend = cbtcAmountWei || DEFAULT_CBTC_AMOUNT;
		const cusdToSend = cusdAmount || DEFAULT_CUSD_AMOUNT;

		console.log(
			`[Onramp] Preparing to fund ${recipientAddress} with ${ethers.formatEther(cbtcToSend)} CBTC and ${ethers.formatUnits(cusdToSend, 18)} CUSD`,
		);

		// Check faucet wallet CBTC balance
		const faucetBalance = await citreaProvider.getBalance(faucetWallet.address);
		console.log(
			`[Onramp] Faucet CBTC balance: ${ethers.formatEther(faucetBalance)} CBTC`,
		);

		if (faucetBalance < cbtcToSend) {
			throw new Error(
				`Insufficient faucet CBTC balance. Required: ${ethers.formatEther(cbtcToSend)} CBTC, Available: ${ethers.formatEther(faucetBalance)} CBTC`,
			);
		}

		// Warn if faucet CBTC balance is getting low
		if (faucetBalance < MIN_FAUCET_BALANCE) {
			console.warn(
				`[Onramp] ⚠️ Faucet CBTC balance is low! Current: ${ethers.formatEther(faucetBalance)} CBTC, Minimum: ${ethers.formatEther(MIN_FAUCET_BALANCE)} CBTC`,
			);
		}

		// Initialize CUSD token contract
		const cusdContract = new ethers.Contract(
			CUSD_TOKEN_ADDRESS,
			ERC20_ABI,
			faucetWallet,
		);

		// Check faucet wallet CUSD balance
		const cusdBalance = await cusdContract.balanceOf(faucetWallet.address);
		console.log(
			`[Onramp] Faucet CUSD balance: ${ethers.formatUnits(cusdBalance, 18)} CUSD`,
		);

		if (cusdBalance < cusdToSend) {
			throw new Error(
				`Insufficient faucet CUSD balance. Required: ${ethers.formatUnits(cusdToSend, 18)} CUSD, Available: ${ethers.formatUnits(cusdBalance, 18)} CUSD`,
			);
		}

		// Get current gas price for estimation
		const feeData = await citreaProvider.getFeeData();
		console.log(
			`[Onramp] Current gas price: ${feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "unknown"} gwei`,
		);

		// Step 1: Send CBTC
		console.log(`[Onramp] Step 1/2: Sending CBTC...`);
		const cbtcTx = await faucetWallet.sendTransaction({
			to: recipientAddress,
			value: cbtcToSend,
			gasLimit: 21000n, // Standard ETH transfer gas limit
		});

		console.log(
			`[Onramp] CBTC transaction submitted: ${cbtcTx.hash}. Waiting for confirmation...`,
		);

		const cbtcReceipt = await cbtcTx.wait();

		if (!cbtcReceipt) {
			throw new Error("CBTC transaction receipt is null");
		}

		if (cbtcReceipt.status === 0) {
			throw new Error("CBTC transaction failed on-chain");
		}

		console.log(
			`[Onramp] ✅ Successfully sent ${ethers.formatEther(cbtcToSend)} CBTC`,
		);
		console.log(`[Onramp] CBTC Transaction hash: ${cbtcReceipt.hash}`);

		// Step 2: Send CUSD tokens
		console.log(`[Onramp] Step 2/2: Sending CUSD tokens...`);
		const cusdTx = await cusdContract.transfer(recipientAddress, cusdToSend);

		console.log(
			`[Onramp] CUSD transaction submitted: ${cusdTx.hash}. Waiting for confirmation...`,
		);

		const cusdReceipt = await cusdTx.wait();

		if (!cusdReceipt) {
			throw new Error("CUSD transaction receipt is null");
		}

		if (cusdReceipt.status === 0) {
			throw new Error("CUSD transaction failed on-chain");
		}

		console.log(
			`[Onramp] ✅ Successfully sent ${ethers.formatUnits(cusdToSend, 18)} CUSD`,
		);
		console.log(`[Onramp] CUSD Transaction hash: ${cusdReceipt.hash}`);

		console.log(`[Onramp] 🎉 Funding complete for ${recipientAddress}`);
		console.log(
			`[Onramp] Total gas used: ${(cbtcReceipt.gasUsed + cusdReceipt.gasUsed).toString()}`,
		);

		return {
			cbtcTransactionHash: cbtcReceipt.hash,
			cusdTransactionHash: cusdReceipt.hash,
			recipientAddress,
			cbtcAmount: cbtcToSend.toString(),
			cusdAmount: cusdToSend.toString(),
		};
	} catch (error) {
		console.error("[Onramp] Failed to fund wallet:", error);

		// Provide more context for common errors
		if (error instanceof Error) {
			if (error.message.includes("insufficient funds")) {
				throw new Error(
					"Faucet wallet has insufficient funds to complete this transaction",
				);
			}
			if (error.message.includes("nonce")) {
				throw new Error(
					"Transaction nonce error. Please try again in a few moments.",
				);
			}
			throw error;
		}

		throw new Error("Failed to fund wallet: Unknown error");
	}
}

/**
 * Get the faucet wallet address
 *
 * @returns The public address of the faucet wallet
 */
export function getFaucetAddress(): string {
	const faucetWallet = getFaucetWallet();
	return faucetWallet.address;
}

/**
 * Get the current balance of the faucet wallet
 *
 * @returns Balance in CBTC as a formatted string
 */
export async function getFaucetBalance(): Promise<string> {
	const faucetWallet = getFaucetWallet();
	const balance = await citreaProvider.getBalance(faucetWallet.address);
	return ethers.formatEther(balance);
}
