import { OpenAPIHono } from "@hono/zod-openapi";
import type { AuthContext } from "../lib/middleware";
import { authMiddleware } from "../lib/middleware";
import { fundUserWallet } from "../lib/onramp";
import { fundWalletRoute } from "../schemas/onramp";

const onramp = new OpenAPIHono<AuthContext>();

// Apply auth middleware to all onramp endpoints
onramp.use("/*", authMiddleware);

/**
 * POST /onramp/fund
 * Fund the authenticated user's wallet with CBTC from the backend faucet wallet
 */
onramp.openapi(fundWalletRoute, async (c) => {
	try {
		// Get authenticated user info from JWT token
		const jwtPayload = c.get("jwtPayload");

		// Extract user's wallet address from sub claim (the account address)
		const recipientAddress = jwtPayload.sub;

		if (!recipientAddress) {
			return c.json(
				{
					error: "Invalid token",
					details:
						"User address not found in authentication token (sub claim missing)",
				},
				400,
			);
		}

		console.log(
			`[Onramp] User ${recipientAddress} requesting funds for their wallet`,
		);

		// Execute the funding transaction
		const result = await fundUserWallet(recipientAddress);

		// Return success response
		return c.json(
			{
				success: true,
				cbtcTransactionHash: result.cbtcTransactionHash,
				cusdTransactionHash: result.cusdTransactionHash,
				recipientAddress: result.recipientAddress,
				cbtcAmount: result.cbtcAmount,
				cusdAmount: result.cusdAmount,
			},
			200,
		);
	} catch (error) {
		console.error("[Onramp] Fund wallet error:", error);

		// Handle specific error cases
		if (error instanceof Error) {
			if (
				error.message.includes("Invalid") ||
				error.message.includes("invalid")
			) {
				return c.json(
					{
						error: "Invalid address",
						details: error.message,
					},
					400,
				);
			}

			if (
				error.message.includes("Insufficient") ||
				error.message.includes("insufficient")
			) {
				return c.json(
					{
						error: "Faucet unavailable",
						details:
							"The faucet is temporarily out of funds. Please try again later.",
					},
					503,
				);
			}

			// Generic error response
			return c.json(
				{
					error: "Funding failed",
					details: error.message,
				},
				500,
			);
		}

		// Unknown error
		return c.json(
			{
				error: "Internal server error",
				details: "An unexpected error occurred while funding the wallet",
			},
			500,
		);
	}
});

export default onramp;
