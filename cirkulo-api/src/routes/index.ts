import { OpenAPIHono } from "@hono/zod-openapi";
import auth from "./auth";

const routes = new OpenAPIHono();

// Mount auth routes
routes.route("/auth", auth);

export default routes;
