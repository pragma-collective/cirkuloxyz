import { ethers } from "ethers";

/**
 * Citrea Blockchain Service
 *
 * Handles interaction with pool contracts on Citrea testnet using backend signer.
 * The backend wallet has limited permissions - can only call inviteMember() on pools.
 */

// Initialize Citrea RPC provider
const citreaProvider = new ethers.JsonRpcProvider(
  process.env.CITREA_RPC_URL || "https://rpc.testnet.citrea.xyz"
);

// Backend signer wallet (same private key used for Lens Protocol operations)
const backendSigner = new ethers.Wallet(
  process.env.BACKEND_SIGNER_PRIVATE_KEY || "",
  citreaProvider
);

/**
 * Minimal ABI for pool contracts - only includes inviteMember function
 * This is all the backend needs since it has limited permissions
 */
const POOL_INVITE_ABI = [
  {
    inputs: [{ internalType: "address", name: "member", type: "address" }],
    name: "inviteMember",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

/**
 * Invites a member to a pool contract on Citrea
 *
 * @param poolAddress - Address of the pool contract (SavingsPool, ROSCAPool, or DonationPool)
 * @param memberAddress - Address of the member to invite
 * @returns Transaction hash of the invite transaction
 * @throws Error if transaction fails or reverts
 */
export async function inviteMemberToPool(
  poolAddress: string,
  memberAddress: string
): Promise<string> {
  try {
    // Validate addresses
    if (!ethers.isAddress(poolAddress)) {
      throw new Error(`Invalid pool address: ${poolAddress}`);
    }
    if (!ethers.isAddress(memberAddress)) {
      throw new Error(`Invalid member address: ${memberAddress}`);
    }

    // Create pool contract instance
    const poolContract = new ethers.Contract(
      poolAddress,
      POOL_INVITE_ABI,
      backendSigner
    );

    // Call inviteMember() on the pool contract
    console.log(`[Citrea] Inviting ${memberAddress} to pool ${poolAddress}...`);
    const tx = await poolContract.inviteMember(memberAddress);

    console.log(`[Citrea] Transaction sent: ${tx.hash}`);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (receipt.status === 0) {
      throw new Error("Transaction reverted");
    }

    console.log(`[Citrea] Member invited successfully. Tx: ${tx.hash}`);
    return tx.hash;
  } catch (error: any) {
    console.error("[Citrea] Error inviting member to pool:", error);

    // Handle common revert reasons
    if (error.message?.includes("Already invited")) {
      throw new Error("Member already invited to this pool");
    }
    if (error.message?.includes("Only creator or backend")) {
      throw new Error("Backend wallet not authorized for this pool");
    }
    if (error.message?.includes("Cannot invite after ROSCA starts")) {
      throw new Error("Cannot invite members after ROSCA has started");
    }

    throw new Error(`Failed to invite member: ${error.message}`);
  }
}

/**
 * Gets the backend signer's wallet address
 * Useful for verifying which address is set as backendManager in factory
 *
 * @returns Backend wallet address
 */
export function getBackendAddress(): string {
  return backendSigner.address;
}

/**
 * Gets the backend signer's cBTC balance on Citrea
 * Useful for monitoring if backend wallet has enough funds for transactions
 *
 * @returns Balance in cBTC (formatted from wei)
 */
export async function getBackendBalance(): Promise<string> {
  try {
    const balance = await citreaProvider.getBalance(backendSigner.address);
    return ethers.formatEther(balance);
  } catch (error: any) {
    console.error("[Citrea] Error fetching backend balance:", error);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
}

/**
 * Checks if the backend signer is properly configured
 *
 * @returns true if private key and RPC are configured
 */
export function isBackendSignerConfigured(): boolean {
  return (
    !!process.env.BACKEND_SIGNER_PRIVATE_KEY &&
    backendSigner.address !== ethers.ZeroAddress
  );
}
