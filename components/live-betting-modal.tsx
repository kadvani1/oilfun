"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { WalletModal } from "./wallet-modal"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { alloMarketsConfig, usdcConfig, ALLO_MARKETS_ADDRESS, parseUSDC, USDC_DECIMALS } from "@/lib/contracts"
import { type FormattedMarket } from "@/hooks/use-market-data"

interface LiveBettingModalProps {
  isOpen: boolean
  onClose: () => void
  market: FormattedMarket
  selectedOption: "yes" | "no"
  onOptionChange: (option: "yes" | "no") => void
  onSuccess?: () => void
}

export function LiveBettingModal({ 
  isOpen, 
  onClose, 
  market, 
  selectedOption, 
  onOptionChange,
  onSuccess 
}: LiveBettingModalProps) {
  const [amount, setAmount] = useState(10)
  const [step, setStep] = useState<"input" | "approving" | "betting" | "success" | "error">("input")
  const [errorMessage, setErrorMessage] = useState("")

  const { address, isConnected } = useAccount()

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...usdcConfig,
    functionName: "allowance",
    args: address ? [address, ALLO_MARKETS_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Check USDC balance
  const { data: balance } = useReadContract({
    ...usdcConfig,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Approve USDC
  const { 
    writeContract: approve, 
    data: approveHash,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract()

  // Wait for approval transaction
  const { isLoading: isWaitingApproval, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Place bet
  const { 
    writeContract: placeBet, 
    data: betHash,
    isPending: isBetting,
    error: betError,
  } = useWriteContract()

  // Wait for bet transaction
  const { isLoading: isWaitingBet, isSuccess: isBetSuccess } = useWaitForTransactionReceipt({
    hash: betHash,
  })

  // Handle approval success
  useEffect(() => {
    if (isApprovalSuccess && step === "approving") {
      refetchAllowance()
      handlePlaceBet()
    }
  }, [isApprovalSuccess])

  // Handle bet success
  useEffect(() => {
    if (isBetSuccess && step === "betting") {
      setStep("success")
      onSuccess?.()
    }
  }, [isBetSuccess])

  // Handle errors
  useEffect(() => {
    if (approveError) {
      setStep("error")
      setErrorMessage(approveError.message || "Approval failed")
    }
    if (betError) {
      setStep("error")
      setErrorMessage(betError.message || "Bet failed")
    }
  }, [approveError, betError])

  const amountInWei = parseUSDC(amount)
  const needsApproval = !allowance || allowance < amountInWei
  const hasInsufficientBalance = balance !== undefined && balance < amountInWei

  const yesPrice = (market.yesPercentage / 100).toFixed(2)
  const noPrice = (market.noPercentage / 100).toFixed(2)
  const currentPercentage = selectedOption === "yes" ? market.yesPercentage : market.noPercentage
  const payout = amount / (currentPercentage / 100)

  const handleApprove = async () => {
    setStep("approving")
    try {
      // Unlimited approval (max uint256) so user doesn't need to approve again
      const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
      approve({
        ...usdcConfig,
        functionName: "approve",
        args: [ALLO_MARKETS_ADDRESS, maxApproval],
      })
    } catch (err) {
      setStep("error")
      setErrorMessage("Failed to initiate approval")
    }
  }

  const handlePlaceBet = async () => {
    setStep("betting")
    try {
      const functionName = selectedOption === "yes" ? "addYesBet" : "addNoBet"
      // Use market.questionId (the actual contract ID) not market.id (array index)
      placeBet({
        ...alloMarketsConfig,
        functionName,
        args: [BigInt(market.questionId), amountInWei],
      })
    } catch (err) {
      setStep("error")
      setErrorMessage("Failed to place bet")
    }
  }

  const handleSubmit = async () => {
    if (needsApproval) {
      handleApprove()
    } else {
      handlePlaceBet()
    }
  }

  const handleClose = () => {
    setStep("input")
    setErrorMessage("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

        {/* Modal */}
        <div className="relative bg-card rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
          {/* Close button */}
          <button onClick={handleClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>

          {/* Live Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-uae-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-uae-green"></span>
            </span>
            <span className="text-xs font-semibold text-uae-green uppercase">Live Market</span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center text-3xl">
              🛢️
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground pr-8">{market.question}</h2>
              <p className={cn(
                "font-semibold",
                selectedOption === "yes" ? "text-uae-green" : "text-uae-red"
              )}>
                Bet {selectedOption === "yes" ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {step === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-uae-green mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Bet Placed Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                Your {selectedOption.toUpperCase()} bet of ${amount} USDC has been placed.
              </p>
              <button
                onClick={handleClose}
                className="bg-gold hover:bg-gold-dark text-dark-charcoal font-semibold px-6 py-3 rounded-xl"
              >
                Close
              </button>
            </div>
          ) : step === "error" ? (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-uae-red mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Transaction Failed</h3>
              <p className="text-muted-foreground mb-4 text-sm">{errorMessage}</p>
              <button
                onClick={() => setStep("input")}
                className="bg-gold hover:bg-gold-dark text-dark-charcoal font-semibold px-6 py-3 rounded-xl"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Yes/No Options */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => onOptionChange("yes")}
                  className={cn(
                    "flex-1 py-6 rounded-2xl text-lg font-semibold transition-all",
                    selectedOption === "yes"
                      ? "bg-uae-green text-white"
                      : "bg-uae-green/10 text-uae-green border-2 border-uae-green/30",
                  )}
                >
                  Yes {yesPrice}¢
                </button>
                <button
                  onClick={() => onOptionChange("no")}
                  className={cn(
                    "flex-1 py-6 rounded-2xl text-lg font-semibold transition-all",
                    selectedOption === "no"
                      ? "bg-uae-red text-white"
                      : "bg-uae-red/10 text-uae-red border-2 border-uae-red/30",
                  )}
                >
                  No {noPrice}¢
                </button>
              </div>

              {/* Amount Input */}
              <div className="border-2 border-gold rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-foreground">Amount (USDC)</p>
                    {balance !== undefined && (
                      <p className="text-gold text-sm">
                        Balance: {(Number(balance) / Math.pow(10, USDC_DECIMALS)).toFixed(2)} USDC
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="text-4xl font-bold text-foreground w-28 text-right bg-transparent outline-none"
                      min={1}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mb-4">
                {[10, 50, 100, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      amount === val
                        ? "bg-gold text-dark-charcoal"
                        : "bg-gold/10 text-gold hover:bg-gold/20"
                    )}
                  >
                    ${val}
                  </button>
                ))}
              </div>

              {/* Odds & Payout */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-base">Odds</span>
                  <span className="text-foreground font-semibold">
                    {currentPercentage.toFixed(2)}% chance
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-base">
                    Potential Payout
                  </span>
                  <span className="text-gold text-2xl font-bold">
                    ${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {!isConnected ? (
                <WalletModal 
                  fullWidth 
                  className="w-full py-6 text-lg font-semibold bg-gold hover:bg-gold-dark text-dark-charcoal rounded-2xl" 
                />
              ) : hasInsufficientBalance ? (
                <button
                  disabled
                  className="w-full py-6 text-lg font-semibold bg-uae-red/50 text-white rounded-2xl cursor-not-allowed"
                >
                  Insufficient USDC Balance
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isApproving || isWaitingApproval || isBetting || isWaitingBet}
                  className={cn(
                    "w-full py-6 text-lg font-semibold rounded-2xl transition-all flex items-center justify-center gap-2",
                    selectedOption === "yes" 
                      ? "bg-uae-green hover:bg-uae-green/90 text-white"
                      : "bg-uae-red hover:bg-uae-red/90 text-white",
                    (isApproving || isWaitingApproval || isBetting || isWaitingBet) && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {(isApproving || isWaitingApproval) && (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Approving USDC...
                    </>
                  )}
                  {(isBetting || isWaitingBet) && (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Placing Bet...
                    </>
                  )}
                  {!isApproving && !isWaitingApproval && !isBetting && !isWaitingBet && (
                    needsApproval ? `Approve & Bet ${selectedOption.toUpperCase()}` : `Bet ${selectedOption.toUpperCase()}`
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

