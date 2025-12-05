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

// Fetch oil prices from the oilprice API route
async function fetchOilPrices(refresh: boolean = false): Promise<OraclePrice[]> {
  try {
    // Use internal API route for oil prices
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const url = refresh 
      ? `${baseUrl}/api/oilprice?refresh=true`
      : `${baseUrl}/api/oilprice`
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Failed to fetch oil prices: ${response.status}`)
      return []
    }

    const data = await response.json()
    
    if (!data.success) {
      console.error("Oil price API returned non-success status")
      return []
    }

    return data.data || []
  } catch (error) {
    console.error("Error fetching oil prices:", error)
    return []
  }
}

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
    fetchOilPrices(refresh),
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

