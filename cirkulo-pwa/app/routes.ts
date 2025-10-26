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
		// Login page (no guard - needs to be accessible to everyone)
		route("login", "routes/login.tsx"),

		// Invite page (no guard - accessible to everyone, handles auth internally)
		route("invite", "routes/invite.tsx"),

		// Auth flow routes (wallet required, but NOT Lens session)
		// Redirects to /dashboard if user is already fully authenticated
		layout("components/auth-flow-guard.tsx", [
			route("onboarding", "routes/onboarding.tsx"),
			route("select-account", "routes/select-account.tsx"),
		]),

		// Authenticated routes (wallet + Lens session required)
		// Redirects to /login if not authenticated
		// Shows loading while AuthContext navigates to onboarding/select-account
		layout("components/authenticated-route.tsx", [
			route("dashboard", "routes/dashboard.tsx"),
			route("explore", "routes/explore.tsx"),
			route("create-circle", "routes/create-circle.tsx"),
			route("profile", "routes/profile.tsx"),
			route("wallet", "routes/wallet.tsx"),
			route("wallet/send", "routes/wallet.send.tsx"),
			route("wallet/receive", "routes/wallet.receive.tsx"),
			route("wallet/on-ramp", "routes/wallet.on-ramp.tsx"),
			route("wallet/transactions", "routes/wallet.transactions.tsx"),
			route("circle/:id", "routes/circle-detail.tsx"),
			route("circle/:id/contribute", "routes/circle.$id.contribute.tsx"),
			route("circle/:id/members", "routes/circle-members.tsx"),
			route("circle/:id/invites", "routes/circle-invites.tsx"),
		]),
	]),
] satisfies RouteConfig;
