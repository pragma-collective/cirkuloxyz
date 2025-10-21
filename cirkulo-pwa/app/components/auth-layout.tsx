import { Outlet } from "react-router";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { WagmiProvider } from "wagmi";
import { AuthProvider } from "app/context/auth-context";
import { wagmiConfig } from "app/lib/wagmi";
import { authEvents } from "app/lib/auth-events";

/**
 * Authentication Layout
 *
 * Wraps routes that need authentication context (login + protected routes).
 * Provides Dynamic wallet, Wagmi, and custom Auth context.
 *
 * Public routes (landing, logo-showcase) don't use this layout.
 */
export default function AuthLayout() {
	return (
		<DynamicContextProvider
			settings={{
				environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
				walletConnectors: [EthereumWalletConnectors],
				events: {
					onAuthSuccess: () => {
						authEvents.emit("authSuccess");
					},
					onLogout: (user) => {
						console.log(
							"[Dynamic] User logged out:",
							user ? "user present" : "no user",
						);
						authEvents.emit("logout");
					},
				},
			}}
		>
			<WagmiProvider config={wagmiConfig}>
				<DynamicWagmiConnector>
					<AuthProvider>
						<Outlet />
					</AuthProvider>
				</DynamicWagmiConnector>
			</WagmiProvider>
		</DynamicContextProvider>
	);
}
