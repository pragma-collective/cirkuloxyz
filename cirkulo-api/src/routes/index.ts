import { OpenAPIHono } from "@hono/zod-openapi";
import auth from "./auth";
import circles from "./circles";
import invites from "./invites";
import onramp from "./onramp";

const routes = new OpenAPIHono();

// Mount auth routes
routes.route("/auth", auth);

// Mount invite routes
routes.route("/invites", invites);

// Mount circle routes
routes.route("/circles", circles);

// Mount onramp routes
routes.route("/onramp", onramp);

export default routes;
