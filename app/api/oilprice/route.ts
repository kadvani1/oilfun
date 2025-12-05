import { NextRequest, NextResponse } from "next/server"

// Round-robin key index - using a module-level variable for key rotation
let currentKeyIndex = 0

// Local cache for oil prices
interface CachedData {
  prices: OilPrice[]
  cachedAt: number
}

let cachedOilPrices: CachedData | null = null

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

interface OilPrice {
  name: string
  price: number
  change: string
  timestamp: number
  source: string
}

interface ApiResponse {
  success: boolean
  data: OilPrice[]
  error?: string
}

// Get API keys from environment
function getApiKeys(): string[] {
  const keys: string[] = []
  
  const key1 = process.env.OILPRICE_API_KEY
  const key2 = process.env.OILPRICE_API_KEY_2
  
  if (key1) keys.push(key1)
  if (key2) keys.push(key2)
  
  return keys
}

// Get next API key in round-robin fashion
function getNextApiKey(): string | null {
  const keys = getApiKeys()
  
  if (keys.length === 0) {
    return null
  }
  
  const key = keys[currentKeyIndex]
  // Rotate to next key for the next call
  currentKeyIndex = (currentKeyIndex + 1) % keys.length
  
  return key
}

// Fetch a single oil price by code
async function fetchSingleOilPrice(code: string, apiKey: string): Promise<OilPrice | null> {
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
      const errorText = await response.text()
      console.error(`Failed to fetch ${code} price: ${response.status}`, errorText)
      return null
    }
    
    const data: OilPriceApiResponse = await response.json()
    console.log(`${code} API Response:`, JSON.stringify(data, null, 2))
    
    if (data.status !== "success" || !data.data) {
      console.error(`${code} API returned non-success status:`, data)
      return null
    }
    
    // Determine display name from code
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

// Fetch oil prices from the API
async function fetchOilPrices(): Promise<OilPrice[]> {
  const apiKey = getNextApiKey()
  
  console.log("Using Oil Price API Key:", apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : "NOT SET")
  
  if (!apiKey) {
    console.error("Missing Oil Price API credentials. Set OILPRICE_API_KEY and/or OILPRICE_API_KEY_2 in .env.local")
    return []
  }
  
  // Fetch both BRENT and WTI in parallel
  const [brentPrice, wtiPrice] = await Promise.all([
    fetchSingleOilPrice("BRENT_CRUDE_USD", apiKey),
    fetchSingleOilPrice("WTI_USD", apiKey),
  ])
  
  const prices: OilPrice[] = []
  
  if (brentPrice) {
    prices.push(brentPrice)
  }
  
  if (wtiPrice) {
    prices.push(wtiPrice)
  }
  
  return prices
}

// GET handler - fetch oil prices
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const refresh = searchParams.get("refresh") === "true"
  
  // Return cached data if available and refresh not requested
  if (!refresh && cachedOilPrices && cachedOilPrices.prices.length > 0) {
    console.log("Returning cached oil prices from:", new Date(cachedOilPrices.cachedAt).toISOString())
    const response: ApiResponse = {
      success: true,
      data: cachedOilPrices.prices,
    }
    return NextResponse.json(response)
  }
  
  // Fetch fresh data
  console.log("Fetching fresh oil prices...")
  const prices = await fetchOilPrices()
  
  if (prices.length === 0) {
    // If fetch failed but we have cached data, return it
    if (cachedOilPrices && cachedOilPrices.prices.length > 0) {
      console.log("Fetch failed, returning stale cached data")
      const response: ApiResponse = {
        success: true,
        data: cachedOilPrices.prices,
      }
      return NextResponse.json(response)
    }
    
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch oil prices",
    }
    return NextResponse.json(response, { status: 500 })
  }
  
  // Update cache
  cachedOilPrices = {
    prices,
    cachedAt: Date.now(),
  }
  console.log("Oil prices cached at:", new Date(cachedOilPrices.cachedAt).toISOString())
  
  const response: ApiResponse = {
    success: true,
    data: prices,
  }
  
  return NextResponse.json(response)
}

