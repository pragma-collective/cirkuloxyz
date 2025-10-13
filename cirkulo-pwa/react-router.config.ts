import type { Config } from "@react-router/dev/config";

export default {
	// SPA mode enabled for client-side only PWA
	ssr: false,
	// SPA optimizations
	basename: "/",
} satisfies Config;
