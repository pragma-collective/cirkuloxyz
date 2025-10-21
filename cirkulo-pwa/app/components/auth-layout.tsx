import { Outlet } from "react-router";
import {
	DynamicContextProvider,
	mergeNetworks,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { WagmiProvider } from "wagmi";
import { AuthProvider } from "app/context/auth-context";
import { wagmiConfig } from "app/lib/wagmi";
import { authEvents } from "app/lib/auth-events";

/**
 * Lens Testnet custom network configuration
 * Chain ID: 37111 (Lens Network Sepolia Testnet)
 */
const lensTestnet = [
	{
		blockExplorerUrls: ["https://testnet.lenscan.io/"],
		chainId: 37111,
		chainName: "Lens Chain Testnet",
		iconUrls: ["https://www.lens.xyz/favicon.ico"],
		name: "Lens Testnet",
		nativeCurrency: {
			name: "GRASS",
			symbol: "GRASS",
			decimals: 18,
		},
		networkId: 37111,
		rpcUrls: ["https://rpc.testnet.lens.dev"],
		vanityName: "Lens Testnet",
	},
];

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
				overrides: {
					evmNetworks: (networks) => mergeNetworks(lensTestnet, networks),
				},
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
