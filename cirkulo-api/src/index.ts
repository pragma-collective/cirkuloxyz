import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { z } from "zod";
import routes from "./routes";

const app = new OpenAPIHono();

// Enable CORS for all origins
app.use(
	"/*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: false,
	}),
);

// Schema for health check response
const HealthCheckSchema = z.object({
	status: z.string(),
	message: z.string(),
	version: z.string(),
});

// Health check route definition
const healthCheckRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Health"],
	summary: "Health check endpoint",
	responses: {
		200: {
			description: "API is running",
			content: {
				"application/json": {
					schema: HealthCheckSchema,
				},
			},
		},
	},
});

// Health check
app.openapi(healthCheckRoute, (c) => {
	return c.json({
		status: "ok",
		message: "Cirkulo API is running",
		version: "1.0.0",
	});
});

// Mount all API routes
app.route("/api", routes);

// OpenAPI documentation endpoint with security schemes
app.get("/doc", (c) => {
	const doc = app.getOpenAPIDocument({
		openapi: "3.1.0",
		info: {
			title: "Cirkulo API",
			version: "1.0.0",
			description: "API documentation for Cirkulo platform",
		},
	});

	// Add security schemes for JWT authentication
	doc.components = doc.components || {};
	doc.components.securitySchemes = {
		bearerAuth: {
			type: "http",
			scheme: "bearer",
			bearerFormat: "JWT",
			description: "Enter your JWT token",
		},
	};

	return c.json(doc);
});

// Swagger UI
app.get("/swagger", swaggerUI({ url: "/doc" }));

// Get port from environment variable or use default
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 8000;

export default {
	port,
	fetch: app.fetch,
};
