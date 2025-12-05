"use client"

import { TrendingUp, TrendingDown, Clock, ExternalLink } from "lucide-react"

const oilPrices = [
  {
    name: "Brent Crude",
    symbol: "BRENT/USD",
    price: 82.47,
    change: 1.23,
    changePercent: 1.51,
    high24h: 83.12,
    low24h: 80.95,
    lastUpdate: "2 sec ago",
  },
  {
    name: "WTI Crude",
    symbol: "WTI/USD",
    price: 78.34,
    change: 0.89,
    changePercent: 1.15,
    high24h: 79.01,
    low24h: 77.12,
    lastUpdate: "2 sec ago",
  },
  {
    name: "Dubai Crude",
    symbol: "DUBAI/USD",
    price: 81.22,
    change: -0.45,
    changePercent: -0.55,
    high24h: 82.1,
    low24h: 80.5,
    lastUpdate: "5 sec ago",
  },
  {
    name: "OPEC Basket",
    symbol: "OPEC/USD",
    price: 83.91,
    change: 1.67,
    changePercent: 2.03,
    high24h: 84.2,
    low24h: 81.8,
    lastUpdate: "3 sec ago",
  },
  {
    name: "Murban Crude",
    symbol: "MURBAN/USD",
    price: 82.85,
    change: 0.92,
    changePercent: 1.12,
    high24h: 83.4,
    low24h: 81.6,
    lastUpdate: "4 sec ago",
  },
  {
    name: "Natural Gas",
    symbol: "NATGAS/USD",
    price: 2.847,
    change: -0.053,
    changePercent: -1.83,
    high24h: 2.92,
    low24h: 2.81,
    lastUpdate: "2 sec ago",
  },
  {
    name: "Heating Oil",
    symbol: "HO/USD",
    price: 2.5634,
    change: 0.0234,
    changePercent: 0.92,
    high24h: 2.58,
    low24h: 2.52,
    lastUpdate: "6 sec ago",
  },
  {
    name: "Gasoline RBOB",
    symbol: "RBOB/USD",
    price: 2.4521,
    change: 0.0312,
    changePercent: 1.29,
    high24h: 2.47,
    low24h: 2.41,
    lastUpdate: "3 sec ago",
  },
]

export function OracleFeed() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Oracle Price Feeds</h2>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          Real-time oil & energy prices
          <span className="inline-flex items-center gap-1 text-gold text-sm font-medium">
            Powered by Apro
            <ExternalLink className="h-3 w-3" />
          </span>
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Asset</div>
          <div className="text-right">Price</div>
          <div className="text-right">24h Change</div>
          <div className="text-right">24h High</div>
          <div className="text-right">24h Low</div>
          <div className="text-right">Last Update</div>
        </div>

        {oilPrices.map((item, index) => (
          <div
            key={item.symbol}
            className={`grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors ${
              index !== oilPrices.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-lg">🛢️</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-foreground text-lg">
                ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
            </div>
            <div className="text-right">
              <div
                className={`flex items-center justify-end gap-1 ${item.change >= 0 ? "text-uae-green" : "text-uae-red"}`}
              >
                {item.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  {item.change >= 0 ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="text-right text-foreground">${item.high24h.toFixed(2)}</div>
            <div className="text-right text-foreground">${item.low24h.toFixed(2)}</div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {item.lastUpdate}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gold/10 rounded-lg border border-gold/30">
        <p className="text-sm text-foreground">
          <span className="font-semibold text-gold">Apro Oracle</span> provides decentralized, tamper-proof price feeds
          for oil and energy markets. Data is aggregated from multiple premium sources and updated every block.
        </p>
      </div>
    </div>
  )
}
