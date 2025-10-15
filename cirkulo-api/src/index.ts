import { Hono } from "hono";
import routes from "./routes";

const app = new Hono();

// Health check
app.get("/", (c) => {
	return c.json({
		status: "ok",
		message: "Cirkulo API is running",
		version: "1.0.0",
	});
});

// Mount all API routes
app.route("/api", routes);

export default app;
