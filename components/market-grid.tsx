"use client"

import { useState } from "react"
import { MarketCard } from "@/components/market-card"
import { cn } from "@/lib/utils"

const categories = ["All", "Crude Oil", "Natural Gas", "OPEC", "Energy ETFs"]

const markets = [
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
    selected: true,
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
  {
    id: 9,
    icon: "🛢️",
    iconBg: "bg-gold-light",
    question: "Oil demand reaches new all-time high in 2026?",
    options: [
      { label: "Yes", percentage: 64 },
      { label: "No", percentage: 36 },
    ],
    volume: "$8,382,910",
  },
  {
    id: 10,
    icon: "🌍",
    iconBg: "bg-uae-green/20",
    question: "OPEC market share falls below 30% by 2026?",
    options: [
      { label: "Yes", percentage: 23 },
      { label: "No", percentage: 77 },
    ],
    volume: "$3,293,182",
  },
  {
    id: 11,
    icon: "🔥",
    iconBg: "bg-uae-red/20",
    question: "European gas prices spike 50%+ in 2026?",
    options: [
      { label: "Yes", percentage: 31 },
      { label: "No", percentage: 69 },
    ],
    volume: "$5,182,394",
  },
  {
    id: 12,
    icon: "🛢️",
    iconBg: "bg-gold-light",
    question: "ADNOC acquires another major oil company in 2026?",
    options: [
      { label: "Yes", percentage: 18 },
      { label: "No", percentage: 82 },
    ],
    volume: "$4,382,910",
  },
]

export function MarketGrid() {
  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-6">Trending</h2>

      {/* Category Tabs */}
      <div className="flex gap-6 mb-8 border-b border-border">
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

      {/* Market Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  )
}
