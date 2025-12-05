import { bsc } from "wagmi/chains"
import AlloMarketsABI from "@/ABI/AlloMarketsABI.json"
import ERC20ABI from "@/ABI/ERC20ABI.json"

// BSC RPC endpoint (Binance public dataseed)
export const BSC_RPC_URL = "https://bsc-dataseed1.binance.org"

// Contract addresses on BSC
export const ALLO_MARKETS_ADDRESS = "0x47c20426C7097dB113466421b8aeDCC813137B69" as const
export const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" as const

// Contract configs for wagmi
export const alloMarketsConfig = {
  address: ALLO_MARKETS_ADDRESS,
  abi: AlloMarketsABI,
  chainId: bsc.id,
} as const

export const usdcConfig = {
  address: USDC_ADDRESS,
  abi: ERC20ABI,
  chainId: bsc.id,
} as const

// USDC has 18 decimals on BSC
export const USDC_DECIMALS = 18

// Helper to format USDC amounts
export function formatUSDC(amount: bigint): number {
  return Number(amount) / Math.pow(10, USDC_DECIMALS)
}

// Helper to parse USDC amounts
export function parseUSDC(amount: number): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, USDC_DECIMALS)))
}

