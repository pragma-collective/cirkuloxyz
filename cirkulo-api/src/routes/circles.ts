import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, or } from "drizzle-orm";
import { db } from "../db";
import { circles as circlesTable } from "../db/schema";
import type { AuthContext } from "../lib/middleware";
import { authMiddleware } from "../lib/middleware";
import {
	createCircleRoute,
	getCircleRoute,
} from "../schemas/circles";

const circles = new OpenAPIHono<AuthContext>();

// Apply auth middleware only to create endpoint
circles.use("/create", authMiddleware);

// Create circle endpoint
circles.openapi(createCircleRoute, async (c) => {
	try {
		// Get validated request body
		const body = c.req.valid("json");
		const { circleName, poolAddress, lensGroupAddress, poolDeploymentTxHash, circleType } = body;

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
					circleType: circle.circleType,
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
