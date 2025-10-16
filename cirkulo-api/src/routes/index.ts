import { OpenAPIHono } from "@hono/zod-openapi";
import auth from "./auth";
import invites from "./invites";

const routes = new OpenAPIHono();

// Mount auth routes
routes.route("/auth", auth);

// Mount invite routes
routes.route("/invites", invites);

export default routes;
