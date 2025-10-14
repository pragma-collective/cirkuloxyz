import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("logo-showcase", "routes/logo-showcase.tsx"),
] satisfies RouteConfig;
