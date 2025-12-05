import { NextRequest, NextResponse } from "next/server"

// Supported cryptocurrencies
const SUPPORTED_CURRENCIES = ["BTC", "BNB", "ETH"] as const
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

interface OraclePrice {
  name: string
  price: number
  timestamp: number
  source: string
  change?: string
}

interface OracleResponse {
  success: boolean
  data: OraclePrice[]
  oilPrices?: OraclePrice[]
  error?: string
}

// ============ Oil Price Fetching Logic (inline to avoid self-referential API calls) ============

interface OilPriceApiResponse {
  status: string
  data: {
    price: number
    formatted: string
    currency: string
    code: string
    created_at: string
    type: string
    source: string
    changes: {
      "24h": {
        amount: number
        percent: number
        previous_price: number
      }
    }
  }
}

// Round-robin key index for oil price API
let oilKeyIndex = 0

// Cache for oil prices
interface OilCachedData {
  prices: OraclePrice[]
  cachedAt: number
}
let cachedOilPrices: OilCachedData | null = null
const OIL_CACHE_TTL = 60000 // 1 minute cache

// Get oil price API keys
function getOilApiKeys(): string[] {
  const keys: string[] = []
  const key1 = process.env.OILPRICE_API_KEY
  const key2 = process.env.OILPRICE_API_KEY_2
  if (key1) keys.push(key1)
  if (key2) keys.push(key2)
  return keys
}

// Get next oil API key
function getNextOilApiKey(): string | null {
  const keys = getOilApiKeys()
  if (keys.length === 0) return null
  const key = keys[oilKeyIndex]
  oilKeyIndex = (oilKeyIndex + 1) % keys.length
  return key
}

// Fetch single oil price
async function fetchSingleOilPrice(code: string, apiKey: string): Promise<OraclePrice | null> {
  try {
    const response = await fetch(
      `https://api.oilpriceapi.com/v1/prices/latest?by_code=${code}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    )
    
    if (!response.ok) {
      console.error(`Failed to fetch ${code} price: ${response.status}`)
      return null
    }
    
    const data: OilPriceApiResponse = await response.json()
    
    if (data.status !== "success" || !data.data) {
      console.error(`${code} API returned non-success status`)
      return null
    }
    
    const name = data.data.code.includes("BRENT") ? "BRENT" : "WTI"
    
    return {
      name,
      price: data.data.price,
      change: `${data.data.changes["24h"].percent >= 0 ? "+" : ""}${data.data.changes["24h"].percent.toFixed(2)}%`,
      timestamp: new Date(data.data.created_at).getTime(),
      source: "Oil Price API",
    }
  } catch (error) {
    console.error(`Error fetching ${code} price:`, error)
    return null
  }
}

// Fetch oil prices directly (no internal HTTP request)
async function fetchOilPricesDirect(refresh: boolean = false): Promise<OraclePrice[]> {
  // Return cached data if available and not expired
  if (!refresh && cachedOilPrices && cachedOilPrices.prices.length > 0) {
    const age = Date.now() - cachedOilPrices.cachedAt
    if (age < OIL_CACHE_TTL) {
      console.log("Using cached oil prices, age:", Math.floor(age / 1000), "seconds")
      return cachedOilPrices.prices
    }
  }
  
  const apiKey = getNextOilApiKey()
  
  console.log("Oil Price API Key:", apiKey ? `${apiKey.substring(0, 8)}...` : "NOT SET")
  
  if (!apiKey) {
    console.error("Missing OILPRICE_API_KEY environment variable")
    // Return stale cache if available
    if (cachedOilPrices && cachedOilPrices.prices.length > 0) {
      return cachedOilPrices.prices
    }
    return []
  }
  
  const [brentPrice, wtiPrice] = await Promise.all([
    fetchSingleOilPrice("BRENT_CRUDE_USD", apiKey),
    fetchSingleOilPrice("WTI_USD", apiKey),
  ])
  
  const prices: OraclePrice[] = []
  if (brentPrice) prices.push(brentPrice)
  if (wtiPrice) prices.push(wtiPrice)
  
  // Update cache
  if (prices.length > 0) {
    cachedOilPrices = { prices, cachedAt: Date.now() }
  }
  
  return prices
}

// Fetch price for a single currency from APRO Oracle
async function fetchCurrencyPrice(currency: SupportedCurrency): Promise<OraclePrice | null> {
  // Use server-side env vars (no NEXT_PUBLIC_ prefix for security)
  const apiKey = process.env.APRO_API_KEY
  const apiSecret = process.env.APRO_API_SECRET

  if (!apiKey || !apiSecret) {
    console.error("Missing APRO API credentials. Set APRO_API_KEY and APRO_API_SECRET in .env.local")
    return null
  }

  try {
    const response = await fetch(
      `https://api-ai-oracle.apro.com/v2/ticker/currency/price?name=${currency}&quotation=usd&type=median`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-API-KEY": apiKey,
          "X-API-SECRET": apiSecret,
        },
        // Cache for 10 seconds to avoid rate limiting
        next: { revalidate: 10 },
      }
    )

    if (!response.ok) {
      console.error(`Failed to fetch ${currency} price: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    return {
      name: currency,
      price: data.price || data.data?.price || 0,
      timestamp: Date.now(),
      source: "APRO Oracle",
    }
  } catch (error) {
    console.error(`Error fetching ${currency} price:`, error)
    return null
  }
}

// Delay function for staggered requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// GET handler - fetch all prices
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const currencyParam = searchParams.get("currency")
  const refresh = searchParams.get("refresh") === "true"

  // If specific currency requested
  if (currencyParam) {
    const currency = currencyParam.toUpperCase() as SupportedCurrency
    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      return NextResponse.json(
        { success: false, error: `Unsupported currency: ${currencyParam}` },
        { status: 400 }
      )
    }

    const price = await fetchCurrencyPrice(currency)
    if (!price) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch ${currency} price` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: [price] })
  }

  // Fetch crypto and oil prices in parallel
  const cryptoPromises = SUPPORTED_CURRENCIES.map(async (currency, index) => {
    // Stagger crypto requests
    await delay(index * 100)
    return fetchCurrencyPrice(currency)
  })

  // Call both APIs in parallel (pass refresh flag to oil prices)
  const [cryptoResults, oilPrices] = await Promise.all([
    Promise.all(cryptoPromises),
    fetchOilPricesDirect(refresh),
  ])

  const prices: OraclePrice[] = []
  for (const result of cryptoResults) {
    if (result) {
      prices.push(result)
    }
  }

  if (prices.length === 0 && oilPrices.length === 0) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch any prices" },
      { status: 500 }
    )
  }

  const response: OracleResponse = {
    success: true,
    data: prices,
    oilPrices: oilPrices,
  }

  return NextResponse.json(response)
}

