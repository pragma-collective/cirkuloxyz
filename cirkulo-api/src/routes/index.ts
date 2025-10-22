import { OpenAPIHono } from "@hono/zod-openapi";
import auth from "./auth";
import invites from "./invites";
import circles from "./circles";

const routes = new OpenAPIHono();

// Mount auth routes
routes.route("/auth", auth);

// Mount invite routes
routes.route("/invites", invites);

// Mount circle routes
routes.route("/circles", circles);

export default routes;
