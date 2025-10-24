import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// Define Lens Testnet with EIP-712 support
const lensTestnet = defineChain({
  id: 37111,
  name: 'Lens Testnet',
  nativeCurrency: { name: 'GRASS', symbol: 'GRASS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.lens.dev'] },
  },
  blockExplorers: {
    default: { name: 'Lens Explorer', url: 'https://block-explorer.testnet.lens.dev' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})

const config = createConfig({
  chains: [lensTestnet],
  connectors: [injected()],
  transports: {
    [lensTestnet.id]: http(),
  },
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
