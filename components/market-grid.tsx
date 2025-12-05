"use client"

import { useState, useMemo } from "react"
import { MarketCard } from "@/components/market-card"
import { LiveMarketCard } from "@/components/live-market-card"
import { useTotalQuestions } from "@/hooks/use-market-data"
import { cn } from "@/lib/utils"
import { Zap, TrendingUp, Loader2 } from "lucide-react"

const categories = ["All", "Crude Oil", "Natural Gas", "OPEC", "Energy ETFs"]

// Demo markets for display
const demoMarkets = [
  {
    id: 1,
    icon: "🛢️",
    iconBg: "bg-gold-light",
    question: "Will Brent Crude exceed $100/barrel in 2026?",
    options: [
      { label: "Yes", percentage: 34 },
      { label: "No", percentage: 66 },
    ],
    volume: "$12,491,045",
  },
  {
    id: 2,
    icon: "🛢️",
    iconBg: "bg-gold-light",
    question: "WTI Crude drops below $60/barrel by Q2 2026?",
    options: [
      { label: "Yes", percentage: 28 },
      { label: "No", percentage: 72 },
    ],
    volume: "$8,182,920",
  },
  {
    id: 3,
    icon: "⛽",
    iconBg: "bg-sand",
    question: "US gasoline prices exceed $4/gallon summer 2026?",
    options: [
      { label: "Yes", percentage: 55 },
      { label: "No", percentage: 45 },
    ],
    volume: "$6,928,103",
  },
  {
    id: 4,
    icon: "🌍",
    iconBg: "bg-uae-green/20",
    question: "OPEC+ extends production cuts through 2026?",
    options: [
      { label: "Yes", percentage: 78 },
      { label: "No", percentage: 22 },
    ],
    volume: "$9,847,291",
  },
  {
    id: 5,
    icon: "🔥",
    iconBg: "bg-uae-red/20",
    question: "Natural gas exceeds $4/MMBtu in winter 2026?",
    options: [
      { label: "Yes", percentage: 61 },
      { label: "No", percentage: 39 },
    ],
    volume: "$5,293,847",
  },
  {
    id: 6,
    icon: "🛢️",
    iconBg: "bg-gold-light",
    question: "Saudi Aramco increases oil production in 2026?",
    options: [
      { label: "Yes", percentage: 42 },
      { label: "No", percentage: 58 },
    ],
    volume: "$7,182,394",
  },
  {
    id: 7,
    icon: "📈",
    iconBg: "bg-sand",
    question: "XLE ETF outperforms S&P 500 in 2026?",
    options: [
      { label: "Yes", percentage: 39 },
      { label: "No", percentage: 61 },
    ],
    volume: "$4,938,471",
  },
  {
    id: 8,
    icon: "🇦🇪",
    iconBg: "bg-gold-light",
    question: "UAE oil production exceeds 4M barrels/day in 2026?",
    options: [
      { label: "Yes", percentage: 71 },
      { label: "No", percentage: 29 },
    ],
    volume: "$6,847,291",
  },
]

export function MarketGrid() {
  const [activeCategory, setActiveCategory] = useState("All")
  const { totalQuestions, isLoading: isLoadingTotal } = useTotalQuestions()

  // Generate array of question IDs from 0 to totalQuestions-1
  const questionIds = useMemo(() => {
    if (totalQuestions <= 0) return []
    return Array.from({ length: totalQuestions }, (_, i) => i)
  }, [totalQuestions])

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold text-foreground">Trending</h2>

      {/* Category Tabs */}
      <div className="flex gap-6 border-b border-border">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              activeCategory === category ? "text-gold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {category}
            {activeCategory === category && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
          </button>
        ))}
      </div>

      {/* Live Markets Section - Only shown in "All" category */}
      {activeCategory === "All" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-uae-green/10 px-3 py-1.5 rounded-full">
              <Zap className="h-4 w-4 text-uae-green" />
              <span className="text-sm font-semibold text-uae-green">Live Markets</span>
            </div>
            <p className="text-sm text-muted-foreground">Trade with real USDC on BSC</p>
            {totalQuestions > 0 && (
              <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-medium">
                {totalQuestions} market{totalQuestions !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Live Market Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingTotal ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <span className="ml-3 text-muted-foreground">Loading markets...</span>
              </div>
            ) : questionIds.length > 0 ? (
              questionIds.map((questionId) => (
                <LiveMarketCard key={questionId} questionId={questionId} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No live markets available yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo Markets Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gold/10 px-3 py-1.5 rounded-full">
            <TrendingUp className="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold text-gold">More Markets</span>
          </div>
        </div>

        {/* Demo Market Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoMarkets.map((market) => (
            <MarketCard key={market.id} market={market} isDemo />
          ))}
        </div>
      </div>
    </div>
  )
}
