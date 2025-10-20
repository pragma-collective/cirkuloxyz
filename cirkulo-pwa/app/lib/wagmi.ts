import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { chains as lensChains } from "@lens-chain/sdk/viem";

// Define Citrea Testnet (Chain ID 5115)
export const citreaTestnet = defineChain({
  id: 5115,
  name: "Citrea Testnet",
  nativeCurrency: {
    name: "Citrea Bitcoin",
    symbol: "cBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.citrea.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Citrea Explorer",
      url: "https://explorer.testnet.citrea.xyz",
    },
  },
  testnet: true,
});

// Export wagmi config with Citrea testnet and Lens testnet
export const wagmiConfig = createConfig({
  chains: [citreaTestnet, lensChains.testnet],
  transports: {
    [citreaTestnet.id]: http(citreaTestnet.rpcUrls.default.http[0]),
    [lensChains.testnet.id]: http(lensChains.testnet.rpcUrls.default.http[0]),
  },
});
