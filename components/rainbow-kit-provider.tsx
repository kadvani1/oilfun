"use client"

import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http } from "wagmi"
import { bsc } from "wagmi/chains"
import { metaMaskWallet, rabbyWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets"

// Configure chains - only BSC mainnet
const chains = [bsc] as const

// Get project ID from environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID"

// Configure Rainbow Kit
// Pass wallet functions as references (not called), they will be called internally
const config = getDefaultConfig({
  appName: "Oil.fun",
  projectId,
  chains,
  transports: {
    [bsc.id]: http(),
  },
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rabbyWallet,
        walletConnectWallet,
      ],
    },
  ],
  ssr: true, // Enable server-side rendering
})

// Create a query client
const queryClient = new QueryClient()

export function RainbowKitProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={bsc}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

