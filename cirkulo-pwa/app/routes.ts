import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("logo-showcase", "routes/logo-showcase.tsx"),

  // Protected routes wrapped with authentication check
  layout("components/protected-route.tsx", [
    route("onboarding", "routes/onboarding.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("explore", "routes/explore.tsx"),
    route("create-circle", "routes/create-circle.tsx"),
    route("profile", "routes/profile.tsx"),
    route("circle/:id", "routes/circle-detail.tsx"),
    route("circle/:id/members", "routes/circle-members.tsx"),
  ]),
] satisfies RouteConfig;
