"use client"

import { useState } from "react"
import { Plus, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LiveBettingModal } from "@/components/live-betting-modal"
import { useMarketData, type FormattedMarket } from "@/hooks/use-market-data"

interface LiveMarketCardProps {
  questionId: number
}

export function LiveMarketCard({ questionId }: LiveMarketCardProps) {
  const { market, isLoading, error, refetch } = useMarketData(questionId)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes")

  const handleBetClick = (option: "yes" | "no") => {
    setSelectedOption(option)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border-2 border-gold bg-card p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 bg-gold/20 rounded w-20" />
          <div className="h-3 bg-gold/10 rounded w-16" />
        </div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gold/20 flex-shrink-0" />
          <div className="flex-1 min-h-[2.5rem] space-y-2">
            <div className="h-4 bg-gold/20 rounded w-full" />
            <div className="h-4 bg-gold/20 rounded w-2/3" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-10 bg-gold/10 rounded" />
          <div className="h-10 bg-gold/10 rounded" />
        </div>
        <div className="pt-3 border-t border-gold/30">
          <div className="h-4 bg-gold/10 rounded w-24" />
        </div>
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="rounded-xl border-2 border-uae-red/50 bg-card p-4">
        <div className="text-center text-uae-red py-4">
          <p className="font-medium">Failed to load market data</p>
          {error && (
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              {error.message?.substring(0, 100)}
            </p>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border-2 border-gold bg-gradient-to-br from-gold/5 to-transparent p-4 transition-all hover:shadow-lg hover:shadow-gold/10">
        {/* Live Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-uae-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-uae-green"></span>
            </span>
            <span className="text-xs font-semibold text-uae-green uppercase tracking-wide">Live on BSC</span>
          </div>
          <div className="flex items-center gap-1 text-gold">
            <Zap className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Real USDC</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-xl flex-shrink-0">
            🛢️
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-tight min-h-[2.5rem] line-clamp-2">{market.question}</h3>
            {market.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{market.description}</p>
            )}
          </div>
        </div>

        {/* Options with Progress Bar */}
        <div className="space-y-2 mb-4">
          {/* Yes Option */}
          <div className="relative overflow-hidden rounded-lg">
            <div 
              className="absolute inset-0 bg-uae-green/10"
              style={{ width: `${market.yesPercentage}%` }}
            />
            <div className="relative flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Yes</span>
                <span className="text-xs text-muted-foreground">
                  ${market.totalYesAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {market.yesPercentage.toFixed(1)}%
                </span>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs bg-uae-green hover:bg-uae-green/90 text-white font-semibold"
                  onClick={() => handleBetClick("yes")}
                >
                  Bet Yes
                </Button>
              </div>
            </div>
          </div>

          {/* No Option */}
          <div className="relative overflow-hidden rounded-lg">
            <div 
              className="absolute inset-0 bg-uae-red/10"
              style={{ width: `${market.noPercentage}%` }}
            />
            <div className="relative flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">No</span>
                <span className="text-xs text-muted-foreground">
                  ${market.totalNoAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {market.noPercentage.toFixed(1)}%
                </span>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs bg-uae-red hover:bg-uae-red/90 text-white font-semibold"
                  onClick={() => handleBetClick("no")}
                >
                  Bet No
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gold/30">
          <div>
            <span className="text-sm font-medium text-gold">
              ${market.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-muted-foreground ml-1">Volume</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gold hover:text-gold hover:bg-gold/10"
            onClick={() => refetch()}
          >
            <Loader2 className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* End Date */}
        {market.endTimestamp && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Ends: {market.endTimestamp.toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Live Betting Modal */}
      <LiveBettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        market={market}
        selectedOption={selectedOption}
        onOptionChange={setSelectedOption}
        onSuccess={() => refetch()}
      />
    </>
  )
}

