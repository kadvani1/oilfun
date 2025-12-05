"use client"

import { useState } from "react"
import { X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { WalletModal } from "./wallet-modal"

interface BettingModalProps {
  isOpen: boolean
  onClose: () => void
  market: {
    icon: string
    iconBg: string
    question: string
    yesPercentage: number
  }
}

export function BettingModal({ isOpen, onClose, market }: BettingModalProps) {
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes")
  const [amount, setAmount] = useState(1000)

  if (!isOpen) return null

  const yesPrice = (market.yesPercentage / 100).toFixed(2)
  const noPrice = ((100 - market.yesPercentage) / 100).toFixed(2)
  const odds = market.yesPercentage.toFixed(2)
  const payout =
    selectedOption === "yes"
      ? Math.round(amount / (market.yesPercentage / 100))
      : Math.round(amount / ((100 - market.yesPercentage) / 100))

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-card rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
          {/* Close button */}
          <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl", market.iconBg)}>
              {market.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground pr-8">{market.question}</h2>
              <p className="text-uae-green font-semibold">Buy {selectedOption === "yes" ? "Yes" : "No"}</p>
            </div>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setMode("buy")}
              className={cn(
                "flex-1 py-3 rounded-full text-base font-medium transition-all",
                mode === "buy"
                  ? "border-2 border-uae-green text-uae-green bg-transparent"
                  : "border-2 border-border text-muted-foreground bg-muted",
              )}
            >
              Buy
            </button>
            <button
              onClick={() => setMode("sell")}
              className={cn(
                "flex-1 py-3 rounded-full text-base font-medium transition-all",
                mode === "sell"
                  ? "border-2 border-uae-green text-uae-green bg-transparent"
                  : "border-2 border-border text-muted-foreground bg-muted",
              )}
            >
              Sell
            </button>
          </div>

          {/* Yes/No Options */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setSelectedOption("yes")}
              className={cn(
                "flex-1 py-6 rounded-2xl text-lg font-semibold transition-all",
                selectedOption === "yes"
                  ? "bg-uae-green text-white"
                  : "bg-uae-green/10 text-uae-green border-2 border-uae-green/30",
              )}
            >
              Yes {yesPrice}¢
            </button>
            <button
              onClick={() => setSelectedOption("no")}
              className={cn(
                "flex-1 py-6 rounded-2xl text-lg font-semibold transition-all",
                selectedOption === "no"
                  ? "bg-uae-red text-white"
                  : "bg-uae-red/10 text-uae-red border-2 border-uae-red/30",
              )}
            >
              No {noPrice}¢
            </button>
          </div>

          {/* Amount Input */}
          <div className="border-2 border-gold rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-foreground">Amount</p>
                <p className="text-gold text-sm">Earn 3.5% Interest</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl text-muted-foreground">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-4xl font-bold text-foreground w-28 text-right bg-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Odds & Payout */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-base">Odds</span>
              <span className="text-foreground font-semibold">
                {selectedOption === "yes" ? odds : (100 - market.yesPercentage).toFixed(2)}% chance
              </span>
            </div>
            <div className="flex justify-between items-center">
              <button className="flex items-center gap-1 text-muted-foreground text-base">
                Payout if {selectedOption === "yes" ? "Yes" : "No"}
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-gold text-2xl font-bold">${payout.toLocaleString()}</span>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <WalletModal fullWidth className="w-full py-6 text-lg font-semibold bg-gold hover:bg-gold-dark text-dark-charcoal rounded-2xl" />
        </div>
      </div>
    </>
  )
}
