"use client"

import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http } from "wagmi"
import { bsc } from "wagmi/chains"
import { useState, useEffect, type ReactNode } from "react"

// BSC RPC endpoint (Binance public dataseed)
const BSC_RPC_URL = "https://bsc-dataseed1.binance.org"

// Configure chains - only BSC mainnet
const chains = [bsc] as const

// Get project ID from environment variable
// You can get a free project ID at https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

// Configure Rainbow Kit with default wallets
const config = getDefaultConfig({
  appName: "Oil.fun",
  projectId: projectId || "demo-project-id", // Fallback for development
  chains,
  transports: {
    [bsc.id]: http(BSC_RPC_URL),
  },
  ssr: true,
})

// Create a query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

export function RainbowKitProviderWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={bsc}
        >
          {mounted ? children : null}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

