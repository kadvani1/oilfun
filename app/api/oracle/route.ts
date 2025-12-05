import { NextRequest, NextResponse } from "next/server"

// Supported cryptocurrencies
const SUPPORTED_CURRENCIES = ["BTC", "BNB", "ETH"] as const
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

interface OraclePrice {
  name: string
  price: number
  timestamp: number
  source: string
}

interface OracleResponse {
  success: boolean
  data: OraclePrice[]
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

// GET handler - fetch all prices
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const currencyParam = searchParams.get("currency")

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

  // Fetch all currencies in parallel with staggered delays to avoid rate limiting
  const prices: OraclePrice[] = []
  const delayMs = 100 // 100ms delay between requests

  const fetchPromises = SUPPORTED_CURRENCIES.map(async (currency, index) => {
    // Stagger requests
    await delay(index * delayMs)
    return fetchCurrencyPrice(currency)
  })

  const results = await Promise.all(fetchPromises)

  for (const result of results) {
    if (result) {
      prices.push(result)
    }
  }

  if (prices.length === 0) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch any prices" },
      { status: 500 }
    )
  }

  const response: OracleResponse = {
    success: true,
    data: prices,
  }

  return NextResponse.json(response)
}

