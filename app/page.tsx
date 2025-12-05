"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { MarketGrid } from "@/components/market-grid"
import { OracleFeed } from "@/components/oracle-feed"
import { VaultSection } from "@/components/vault-section"

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<"markets" | "oracle" | "vault">("markets")

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {activeTab === "markets" && <MarketGrid />}
        {activeTab === "oracle" && <OracleFeed />}
        {activeTab === "vault" && <VaultSection />}
      </main>
    </div>
  )
}
