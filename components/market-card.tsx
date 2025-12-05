"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
}

export function MarketCard({ market }: MarketCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedYesPercentage, setSelectedYesPercentage] = useState(0)

  const handleYesClick = (percentage: number) => {
    setSelectedYesPercentage(percentage)
    setIsModalOpen(true)
  }

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-card p-4 transition-all hover:shadow-md",
          market.selected ? "border-gold border-2" : "border-border",
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", market.iconBg)}>
            {market.icon}
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-tight flex-1">{market.question}</h3>
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
                    className="h-7 px-3 text-xs bg-uae-green/10 border-uae-green/30 text-uae-green hover:bg-uae-green/20 hover:text-uae-green"
                    onClick={() => handleYesClick(option.label === "Yes" ? option.percentage : 100 - option.percentage)}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs bg-uae-red/10 border-uae-red/30 text-uae-red hover:bg-uae-red/20 hover:text-uae-red"
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
          <span className="text-sm text-gold font-medium">{market.volume}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Betting Modal */}
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
    </>
  )
}
