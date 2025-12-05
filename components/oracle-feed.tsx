"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, Clock, ExternalLink, RefreshCw, Loader2 } from "lucide-react"

// Crypto icons mapping
const cryptoIcons: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  BNB: "🔶",
}

const cryptoNames: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "BNB",
}

const cryptoColors: Record<string, string> = {
  BTC: "bg-orange-500/20",
  ETH: "bg-purple-500/20",
  BNB: "bg-yellow-500/20",
}

interface OraclePrice {
  name: string
  price: number
  timestamp: number
  source: string
}

interface PriceData {
  name: string
  symbol: string
  price: number
  previousPrice: number
  change: number
  changePercent: number
  lastUpdate: string
  timestamp: number
}

export function OracleFeed() {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchPrices = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/oracle")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch prices")
      }

      const now = new Date()
      setLastFetch(now)

      setPrices((prevPrices) => {
        return data.data.map((item: OraclePrice) => {
          const prevPrice = prevPrices.find((p) => p.name === item.name)
          const previousPrice = prevPrice?.price || item.price
          const change = item.price - previousPrice
          const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0

          return {
            name: cryptoNames[item.name] || item.name,
            symbol: `${item.name}/USD`,
            price: item.price,
            previousPrice,
            change,
            changePercent,
            lastUpdate: "Just now",
            timestamp: item.timestamp,
          }
        })
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch only - manual refresh via button
  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  // Update "last update" text
  useEffect(() => {
    if (!lastFetch) return

    const updateTimer = setInterval(() => {
      setPrices((prev) =>
        prev.map((item) => {
          const secondsAgo = Math.floor((Date.now() - item.timestamp) / 1000)
          let lastUpdate = "Just now"
          if (secondsAgo > 60) {
            const minutesAgo = Math.floor(secondsAgo / 60)
            lastUpdate = `${minutesAgo} min ago`
          } else if (secondsAgo > 5) {
            lastUpdate = `${secondsAgo} sec ago`
          }
          return { ...item, lastUpdate }
        })
      )
    }, 1000)

    return () => clearInterval(updateTimer)
  }, [lastFetch])

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Oracle Price Feeds</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Real-time crypto prices
            <span className="inline-flex items-center gap-1 text-gold text-sm font-medium">
              Powered by Apro
              <ExternalLink className="h-3 w-3" />
            </span>
          </p>
        </div>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-uae-red/10 border border-uae-red/30 rounded-lg text-uae-red">
          {error}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Asset</div>
          <div className="text-right">Price</div>
          <div className="text-right">Change</div>
          <div className="text-right">Last Update</div>
        </div>

        {loading && prices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold mb-2" />
            <p className="text-muted-foreground">Loading prices...</p>
          </div>
        ) : prices.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No price data available
          </div>
        ) : (
          prices.map((item, index) => (
            <div
              key={item.symbol}
              className={`grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors ${
                index !== prices.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="col-span-2 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${
                    cryptoColors[item.symbol.split("/")[0]] || "bg-gold/20"
                  } flex items-center justify-center`}
                >
                  <span className="text-lg">
                    {cryptoIcons[item.symbol.split("/")[0]] || "💰"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground text-lg">
                  $
                  {item.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="text-right">
                <div
                  className={`flex items-center justify-end gap-1 ${
                    item.change >= 0 ? "text-uae-green" : "text-uae-red"
                  }`}
                >
                  {item.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {item.change >= 0 ? "+" : ""}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.lastUpdate}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-4 bg-gold/10 rounded-lg border border-gold/30">
        <p className="text-sm text-foreground">
          <span className="font-semibold text-gold">Apro Oracle</span> provides
          decentralized, tamper-proof price feeds for cryptocurrency markets.
          Data is aggregated from multiple premium sources and updated in
          real-time.
        </p>
      </div>
    </div>
  )
}
