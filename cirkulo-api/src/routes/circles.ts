import { OpenAPIHono } from "@hono/zod-openapi";
import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { circles as circlesTable } from "../db/schema";
import { getGroupsByMember } from "../lib/lens";
import type { AuthContext } from "../lib/middleware";
import { authMiddleware } from "../lib/middleware";
import {
	createCircleRoute,
	getCircleRoute,
	getMyCirclesRoute,
} from "../schemas/circles";

const circles = new OpenAPIHono<AuthContext>();

// Apply auth middleware to protected endpoints
circles.use("/create", authMiddleware);
circles.use("/me", authMiddleware);

// Create circle endpoint
circles.openapi(createCircleRoute, async (c) => {
	try {
		// Get validated request body
		const body = c.req.valid("json");
		const {
			circleName,
			poolAddress,
			lensGroupAddress,
			poolDeploymentTxHash,
			circleType,
			currency,
			categories,
		} = body;

		// Get authenticated user info from JWT token
		const jwtPayload = c.get("jwtPayload");

		// Extract creator address from act claim (Account address the token can act on behalf of)
		// @ts-expect-error - act claim is not in the standard JWTPayload type
		const creatorAddress = jwtPayload.act?.sub as string | undefined;

		if (!creatorAddress) {
			return c.json(
				{
					error: "Creator information not found",
					details:
						"Unable to retrieve creator's address from authentication token (act.sub claim missing)",
				},
				400,
			);
		}

		console.log(
			`User ${creatorAddress} is creating circle "${circleName}" with pool ${poolAddress}`,
		);

		// Check for existing circle with same pool address
		const existingPoolCircle = await db
			.select()
			.from(circlesTable)
			.where(eq(circlesTable.poolAddress, poolAddress))
			.limit(1);

		if (existingPoolCircle.length > 0) {
			return c.json(
				{
					error: "Circle already exists",
					details: `A circle with pool address ${poolAddress} already exists`,
				},
				400,
			);
		}

		// Check for existing circle with same lens group address
		const existingLensCircle = await db
			.select()
			.from(circlesTable)
			.where(eq(circlesTable.lensGroupAddress, lensGroupAddress))
			.limit(1);

		if (existingLensCircle.length > 0) {
			return c.json(
				{
					error: "Circle already exists",
					details: `A circle with lens group address ${lensGroupAddress} already exists`,
				},
				400,
			);
		}

		// Create circle record in database
		const [newCircle] = await db
			.insert(circlesTable)
			.values({
				circleName,
				poolAddress,
				lensGroupAddress,
				poolDeploymentTxHash: poolDeploymentTxHash || null,
				creatorAddress,
				circleType,
				currency: currency || "cusd", // Default to cusd if not provided
				categories: categories || null, // Optional categories array
			})
			.returning();

		console.log(`✅ Circle created in database: ${newCircle.id}`);

		// Return success response
		return c.json(
			{
				success: true,
				message: "Circle created successfully",
				data: {
					id: newCircle.id,
					circleName: newCircle.circleName,
					poolAddress: newCircle.poolAddress,
					lensGroupAddress: newCircle.lensGroupAddress,
					circleType: newCircle.circleType,
					currency: newCircle.currency,
					categories: newCircle.categories || undefined,
					creatorAddress: newCircle.creatorAddress,
					createdAt: newCircle.createdAt.toISOString(),
				},
			},
			200,
		);
	} catch (error) {
		console.error("Error creating circle:", error);

		// Generic error response
		return c.json(
			{
				error: "Failed to create circle",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

// Get my circles endpoint (requires auth)
// NOTE: This MUST come before /{address} route to avoid route conflict
circles.openapi(getMyCirclesRoute, async (c) => {
	try {
		// Get authenticated user info from JWT token
		const jwtPayload = c.get("jwtPayload");

		// Extract user address from act claim (Account address the token can act on behalf of)
		// @ts-expect-error - act claim is not in the standard JWTPayload type
		const userAddress = jwtPayload.act?.sub as string | undefined;

		if (!userAddress) {
			return c.json(
				{
					error: "User information not found",
					details:
						"Unable to retrieve user's address from authentication token (act.sub claim missing)",
				},
				401,
			);
		}

		console.log(`Fetching circles for user: ${userAddress}`);

		// Validate address format before calling Lens API
		if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
			console.error(`Invalid Ethereum address format: ${userAddress}`);
			return c.json(
				{
					error: "Invalid address format",
					details:
						"The address from the authentication token is not a valid Ethereum address",
				},
				401,
			);
		}

		// Fetch groups from Lens Protocol where user is a member
		const lensGroups = await getGroupsByMember(userAddress);

		console.log("lens groups: ", lensGroups);

		if (!lensGroups) {
			return c.json(
				{
					error: "Failed to fetch groups from Lens Protocol",
					details: "Unable to retrieve groups from Lens Protocol",
				},
				500,
			);
		}

		console.log(`Found ${lensGroups.length} groups from Lens Protocol`);

		// If no groups found, return empty array
		if (lensGroups.length === 0) {
			return c.json(
				{
					success: true,
					data: [],
				},
				200,
			);
		}

		// Extract lens group addresses
		const lensGroupAddresses = lensGroups.map((group) => group.address);

		// Fetch matching circles from database
		const matchingCircles = await db
			.select()
			.from(circlesTable)
			.where(
				or(
					...lensGroupAddresses.map((address) =>
						eq(circlesTable.lensGroupAddress, address),
					),
				),
			);

		console.log(`Found ${matchingCircles.length} matching circles in database`);

		// Cross-match circles with lens groups
		const enrichedCircles = matchingCircles.map((circle) => {
			const lensGroup = lensGroups.find(
				(group) =>
					group.address.toLowerCase() === circle.lensGroupAddress.toLowerCase(),
			);

			return {
				// Circle data from database
				id: circle.id,
				circleName: circle.circleName,
				poolAddress: circle.poolAddress,
				lensGroupAddress: circle.lensGroupAddress,
				poolDeploymentTxHash: circle.poolDeploymentTxHash,
				circleType: circle.circleType as
					| "contribution"
					| "rotating"
					| "fundraising",
				currency: circle.currency as "cusd" | "cbtc",
				creatorAddress: circle.creatorAddress,
				createdAt: circle.createdAt.toISOString(),
				updatedAt: circle.updatedAt.toISOString(),
				// Lens group data
				lensGroup: {
					address: lensGroup?.address,
					owner: lensGroup?.owner,
					metadata: lensGroup?.metadata,
					timestamp: lensGroup?.timestamp,
				},
			};
		});

		console.log(`✅ Returning ${enrichedCircles.length} enriched circles`);

		return c.json(
			{
				success: true,
				data: enrichedCircles,
			},
			200,
		);
	} catch (error) {
		console.error("Error fetching user circles:", error);

		return c.json(
			{
				error: "Failed to fetch circles",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

// Get circle endpoint (no auth required)
circles.openapi(getCircleRoute, async (c) => {
	try {
		// Get address from path parameter
		const { address } = c.req.valid("param");

		console.log(`Fetching circle by address: ${address}`);

		// Search by either lens group address or pool address
		const [circle] = await db
			.select()
			.from(circlesTable)
			.where(
				or(
					eq(circlesTable.lensGroupAddress, address),
					eq(circlesTable.poolAddress, address),
				),
			)
			.limit(1);

		if (!circle) {
			return c.json(
				{
					error: "Circle not found",
					details: `No circle found with address: ${address}`,
				},
				404,
			);
		}

		console.log(`✅ Circle found: ${circle.id}`);

		// Return circle data
		return c.json(
			{
				success: true,
				data: {
					id: circle.id,
					circleName: circle.circleName,
					poolAddress: circle.poolAddress,
					lensGroupAddress: circle.lensGroupAddress,
					poolDeploymentTxHash: circle.poolDeploymentTxHash,
					circleType: circle.circleType as
						| "contribution"
						| "rotating"
						| "fundraising",
					currency: circle.currency as "cusd" | "cbtc",
					categories: circle.categories || undefined,
					creatorAddress: circle.creatorAddress,
					createdAt: circle.createdAt.toISOString(),
					updatedAt: circle.updatedAt.toISOString(),
				},
			},
			200,
		);
	} catch (error) {
		console.error("Error fetching circle:", error);

		return c.json(
			{
				error: "Failed to fetch circle",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

export default circles;
