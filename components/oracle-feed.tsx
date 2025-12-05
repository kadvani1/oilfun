"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, Clock, ExternalLink, RefreshCw, Loader2, Droplet } from "lucide-react"

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

// Oil types mapping
const oilNames: Record<string, string> = {
  WTI: "West Texas Intermediate",
  BRENT: "Brent Crude",
}

const oilColors: Record<string, string> = {
  WTI: "bg-amber-600/20",
  BRENT: "bg-stone-500/20",
}

interface OraclePrice {
  name: string
  price: number
  timestamp: number
  source: string
  change?: string
}

interface PriceData {
  name: string
  symbol: string
  price: number
  previousPrice: number
  change: number
  changePercent: number
  changeString?: string
  lastUpdate: string
  timestamp: number
  type: "crypto" | "oil"
}

export function OracleFeed() {
  const [cryptoPrices, setCryptoPrices] = useState<PriceData[]>([])
  const [oilPrices, setOilPrices] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchPrices = useCallback(async (refresh: boolean = false) => {
    try {
      setError(null)
      const url = refresh ? "/api/oracle?refresh=true" : "/api/oracle"
      const response = await fetch(url)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch prices")
      }

      const now = new Date()
      setLastFetch(now)

      // Process crypto prices
      if (data.data && data.data.length > 0) {
        setCryptoPrices((prevPrices) => {
          return data.data.map((item: OraclePrice) => {
            const prevPrice = prevPrices.find((p) => p.symbol === `${item.name}/USD`)
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
              type: "crypto" as const,
            }
          })
        })
      }

      // Process oil prices
      if (data.oilPrices && data.oilPrices.length > 0) {
        setOilPrices((prevPrices) => {
          return data.oilPrices.map((item: OraclePrice) => {
            const prevPrice = prevPrices.find((p) => p.symbol === `${item.name}/USD`)
            const previousPrice = prevPrice?.price || item.price
            const change = item.price - previousPrice
            // Parse change string like "+1.2%" to get the percentage
            const changeString = item.change || ""
            const changePercent = parseFloat(changeString.replace("%", "")) || 
              (previousPrice > 0 ? (change / previousPrice) * 100 : 0)

            return {
              name: oilNames[item.name] || item.name,
              symbol: `${item.name}/USD`,
              price: item.price,
              previousPrice,
              change,
              changePercent,
              changeString,
              lastUpdate: "Just now",
              timestamp: item.timestamp || Date.now(),
              type: "oil" as const,
            }
          })
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch only - uses cached data, manual refresh via button
  useEffect(() => {
    fetchPrices(false) // Don't refresh on initial load, use cached data
  }, [fetchPrices])

  // Update "last update" text
  useEffect(() => {
    if (!lastFetch) return

    const updateTimer = setInterval(() => {
      const updateLastUpdateText = (prev: PriceData[]) =>
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

      setCryptoPrices(updateLastUpdateText)
      setOilPrices(updateLastUpdateText)
    }, 1000)

    return () => clearInterval(updateTimer)
  }, [lastFetch])

  // Render a price row
  const renderPriceRow = (item: PriceData, index: number, totalItems: number) => {
    const isOil = item.type === "oil"
    const symbolKey = item.symbol.split("/")[0]
    
    return (
      <div
        key={item.symbol}
        className={`grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors ${
          index !== totalItems - 1 ? "border-b border-border" : ""
        }`}
      >
        <div className="col-span-2 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${
              isOil 
                ? (oilColors[symbolKey] || "bg-amber-500/20")
                : (cryptoColors[symbolKey] || "bg-gold/20")
            } flex items-center justify-center`}
          >
            {isOil ? (
              <Droplet className="h-5 w-5 text-amber-500" />
            ) : (
              <span className="text-lg">
                {cryptoIcons[symbolKey] || "💰"}
              </span>
            )}
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
          {isOil && (
            <p className="text-xs text-muted-foreground">per barrel</p>
          )}
        </div>
        <div className="text-right">
          <div
            className={`flex items-center justify-end gap-1 ${
              item.changePercent >= 0 ? "text-uae-green" : "text-uae-red"
            }`}
          >
            {item.changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {item.changePercent >= 0 ? "+" : ""}
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
    )
  }

  const allPricesEmpty = cryptoPrices.length === 0 && oilPrices.length === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Oracle Price Feeds</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Real-time crypto & oil prices
            <span className="inline-flex items-center gap-1 text-gold text-sm font-medium">
              Powered by Apro & Oil Price API
              <ExternalLink className="h-3 w-3" />
            </span>
          </p>
        </div>
        <button
          onClick={() => fetchPrices(true)}
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
        <div className="p-4 bg-uae-red/10 border border-uae-red/30 rounded-lg text-uae-red">
          {error}
        </div>
      )}

      {/* Oil Prices Section */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Droplet className="h-5 w-5 text-amber-500" />
          Oil Prices
        </h3>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-amber-500/10 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Commodity</div>
            <div className="text-right">Price</div>
            <div className="text-right">Change</div>
            <div className="text-right">Last Update</div>
          </div>

          {loading && oilPrices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500 mb-2" />
              <p className="text-muted-foreground">Loading oil prices...</p>
            </div>
          ) : oilPrices.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">
              No oil price data available
            </div>
          ) : (
            oilPrices.map((item, index) => renderPriceRow(item, index, oilPrices.length))
          )}
        </div>
      </div>

      {/* Crypto Prices Section */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold">₿</span>
          Cryptocurrency Prices
        </h3>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Asset</div>
            <div className="text-right">Price</div>
            <div className="text-right">Change</div>
            <div className="text-right">Last Update</div>
          </div>

          {loading && cryptoPrices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold mb-2" />
              <p className="text-muted-foreground">Loading crypto prices...</p>
            </div>
          ) : cryptoPrices.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">
              No crypto price data available
            </div>
          ) : (
            cryptoPrices.map((item, index) => renderPriceRow(item, index, cryptoPrices.length))
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-amber-500">Oil Price API</span> provides
            real-time crude oil prices for WTI and Brent benchmarks. Prices are updated
            throughout the trading day.
          </p>
        </div>
        <div className="p-4 bg-gold/10 rounded-lg border border-gold/30">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-gold">Apro Oracle</span> provides
            decentralized, tamper-proof price feeds for cryptocurrency markets.
            Data is aggregated from multiple premium sources.
          </p>
        </div>
      </div>
    </div>
  )
}
