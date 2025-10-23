import {
	type RouteConfig,
	index,
	route,
	layout,
} from "@react-router/dev/routes";

export default [
	// Public routes (no auth context)
	index("routes/home.tsx"),
	route("logo-showcase", "routes/logo-showcase.tsx"),

	// Auth-enabled routes (wrapped with auth context)
	layout("components/auth-layout.tsx", [
		// Login page (needs Dynamic for wallet connection)
		route("login", "routes/login.tsx"),

		// Protected routes (requires authentication)
		layout("components/protected-route.tsx", [
			route("select-account", "routes/select-account.tsx"),
			route("onboarding", "routes/onboarding.tsx"),
			route("dashboard", "routes/dashboard.tsx"),
			route("explore", "routes/explore.tsx"),
			route("create-circle", "routes/create-circle.tsx"),
			route("profile", "routes/profile.tsx"),
			route("circle/:id", "routes/circle-detail.tsx"),
			route("circle/:id/contribute", "routes/circle.$id.contribute.tsx"),
			route("circle/:id/members", "routes/circle-members.tsx"),
			route("circle/:id/invites", "routes/circle-invites.tsx"),
		]),
	]),
] satisfies RouteConfig;
