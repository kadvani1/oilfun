"use client"

import { useState } from "react"
import { Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BettingModal } from "@/components/betting-modal"

interface MarketOption {
  label: string
  percentage: number
}

interface Market {
  id: number
  icon: string
  iconBg: string
  question: string
  options: MarketOption[]
  volume: string
  selected?: boolean
}

interface MarketCardProps {
  market: Market
  isDemo?: boolean
}

export function MarketCard({ market, isDemo = false }: MarketCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedYesPercentage, setSelectedYesPercentage] = useState(0)

  const handleYesClick = (percentage: number) => {
    if (isDemo) return // Don't open modal for demo markets
    setSelectedYesPercentage(percentage)
    setIsModalOpen(true)
  }

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-card p-4 transition-all relative",
          market.selected ? "border-gold border-2" : "border-border",
          isDemo ? "opacity-75 hover:opacity-90" : "hover:shadow-md",
        )}
      >
        {/* Demo Badge */}
        {isDemo && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Demo</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", market.iconBg)}>
            {market.icon}
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-tight flex-1 pr-12">{market.question}</h3>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {market.options.map((option) => (
            <div key={option.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{option.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{option.percentage}%</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-7 px-3 text-xs",
                      isDemo 
                        ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                        : "bg-uae-green/10 border-uae-green/30 text-uae-green hover:bg-uae-green/20 hover:text-uae-green"
                    )}
                    onClick={() => handleYesClick(option.label === "Yes" ? option.percentage : 100 - option.percentage)}
                    disabled={isDemo}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-7 px-3 text-xs",
                      isDemo 
                        ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                        : "bg-uae-red/10 border-uae-red/30 text-uae-red hover:bg-uae-red/20 hover:text-uae-red"
                    )}
                    disabled={isDemo}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className={cn("text-sm font-medium", isDemo ? "text-muted-foreground" : "text-gold")}>
            {market.volume}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8",
              isDemo ? "text-muted-foreground/50 cursor-not-allowed" : "text-muted-foreground hover:text-gold"
            )}
            disabled={isDemo}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Coming Soon Overlay for Demo */}
        {isDemo && (
          <div className="absolute inset-0 rounded-xl bg-transparent cursor-not-allowed" />
        )}
      </div>

      {/* Betting Modal - Only for non-demo markets */}
      {!isDemo && (
        <BettingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          market={{
            icon: market.icon,
            iconBg: market.iconBg,
            question: market.question,
            yesPercentage: selectedYesPercentage,
          }}
        />
      )}
    </>
  )
}
