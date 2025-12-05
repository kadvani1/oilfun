"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"

// Dynamically import RainbowKit provider with SSR disabled
// This prevents pino/thread-stream Node.js modules from being bundled
const RainbowKitProviderWrapper = dynamic(
  () => import("./rainbow-kit-provider").then(mod => ({ default: mod.RainbowKitProviderWrapper })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-dark-charcoal flex items-center justify-center">
        <div className="animate-pulse text-gold">Loading...</div>
      </div>
    )
  }
)

export function Providers({ children }: { children: ReactNode }) {
  return <RainbowKitProviderWrapper>{children}</RainbowKitProviderWrapper>
}

