"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { WalletModal } from "./wallet-modal"

interface HeaderProps {
  activeTab: "markets" | "oracle" | "vault"
  onTabChange: (tab: "markets" | "oracle" | "vault") => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="border-b border-border bg-dark-charcoal">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold text-gold">Oil.fun</h1>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onTabChange("markets")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "markets"
                  ? "bg-gold text-dark-charcoal"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Markets
            </button>
            <button
              onClick={() => onTabChange("oracle")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "oracle"
                  ? "bg-gold text-dark-charcoal"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Oracle
            </button>
            <button
              onClick={() => onTabChange("vault")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "vault"
                  ? "bg-gold text-dark-charcoal"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Vault
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
            <Input
              placeholder="Search markets or assets"
              className="w-64 pl-10 bg-white/10 border-gold/30 text-white placeholder:text-white/50"
            />
          </div>
          <WalletModal />
        </div>
      </div>
    </header>
  )
}
