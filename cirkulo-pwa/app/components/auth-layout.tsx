import { Outlet } from "react-router";
import {
	DynamicContextProvider,
	mergeNetworks,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { WagmiProvider } from "wagmi";
import { WalletProvider, useWallet } from "app/context/wallet-context";
import { LensProvider } from "app/context/lens-context";
import { AuthProvider } from "app/context/auth-context";
import { SessionMonitor } from "app/components/session-monitor";
import { wagmiConfig } from "app/lib/wagmi";
import { authEvents } from "app/lib/auth-events";

/**
 * Lens Mainnet custom network configuration
 * Chain ID: 232 (Lens Network Mainnet)
 */
const lensMainnet = [
	{
		blockExplorerUrls: ["https://lenscan.io/"],
		chainId: 232,
		chainName: "Lens Chain",
		iconUrls: ["https://www.lens.xyz/favicon.ico"],
		name: "Lens Mainnet",
		nativeCurrency: {
			name: "GHO",
			symbol: "GHO",
			decimals: 18,
		},
		networkId: 232,
		rpcUrls: ["https://rpc.lens.dev"],
		vanityName: "Lens Mainnet",
	},
];

/**
 * Lens Provider Wrapper
 *
 * Wraps LensProvider with wallet address from WalletContext.
 * Must be inside WalletProvider to access useWallet().
 */
function LensProviderWrapper({ children }: { children: React.ReactNode }) {
	const { walletAddress } = useWallet();
	// Convert null to undefined for LensProvider
	return <LensProvider walletAddress={walletAddress || undefined}>{children}</LensProvider>;
}

/**
 * Authentication Layout
 *
 * Wraps routes that need authentication context (login + protected routes).
 * Provides Dynamic wallet, Wagmi, Wallet, Lens, and Auth contexts.
 *
 * Context hierarchy:
 * - DynamicContextProvider (Dynamic SDK)
 * - WagmiProvider (Ethereum interactions)
 * - DynamicWagmiConnector (Connects Dynamic to Wagmi)
 * - WalletProvider (Wallet state management)
 * - LensProvider (Lens Protocol session management)
 * - AuthProvider (Unified auth state)
 *
 * Public routes (landing, logo-showcase) don't use this layout.
 *
 * ## Dynamic SDK Session Management
 *
 * **How Dynamic handles sessions:**
 * - Dynamic SDK manages JWT tokens internally using browser storage (localStorage/sessionStorage)
 * - Tokens are automatically refreshed in the background while user is active
 * - Session state is exposed via `useDynamicContext()` hook (`user`, `primaryWallet`)
 * - SDK provides `handleLogOut()` method to clear session and disconnect wallet
 *
 * **Session lifecycle:**
 * 1. User connects wallet → `onAuthSuccess` event fires
 * 2. Dynamic stores JWT tokens internally
 * 3. SDK automatically refreshes tokens before expiration
 * 4. If refresh fails or user logs out elsewhere → `onLogout` event fires
 * 5. SDK clears internal storage on logout
 *
 * **Event handling:**
 * - `onAuthSuccess`: Fired when wallet connection + authentication succeeds
 *   - We emit `authEvents.emit("authSuccess")` for app-wide coordination
 * - `onLogout`: Fired when session is cleared (manual logout, token refresh failure, etc.)
 *   - We emit `authEvents.emit("logout")` to trigger cleanup in AuthContext
 *   - AuthContext listens to this event and logs out of Lens session
 *
 * **Session persistence:**
 * - Dynamic sessions persist across page refreshes automatically
 * - No manual session resumption needed for wallet connection
 * - SDK handles token storage, retrieval, and validation transparently
 *
 * **Session expiration:**
 * - Dynamic handles token expiration automatically
 * - No manual expiration checks required
 * - SDK will fire `onLogout` if session becomes invalid
 * - We don't need to implement keep-alive mechanisms for Dynamic
 */
export default function AuthLayout() {
	return (
		<DynamicContextProvider
			settings={{
				environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
				walletConnectors: [EthereumWalletConnectors],
				overrides: {
					evmNetworks: (networks) => mergeNetworks(lensMainnet, networks),
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
					<WalletProvider>
						<LensProviderWrapper>
							<AuthProvider>
								{/* Background session monitoring */}
								{/*<SessionMonitor />*/}
								<Outlet />
							</AuthProvider>
						</LensProviderWrapper>
					</WalletProvider>
				</DynamicWagmiConnector>
			</WagmiProvider>
		</DynamicContextProvider>
	);
}
