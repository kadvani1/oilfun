"use client"

import { useState } from "react"
import { Wallet, TrendingUp, Shield, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletModal } from "./wallet-modal"

export function VaultSection() {
  const [depositAmount, setDepositAmount] = useState("1000")
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const apy = 3.5
  const tvl = 24582910
  const yourDeposit = 0
  const earnedAmount = Number.parseFloat(depositAmount || "0") * (apy / 100)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Oil Yield Vault</h2>
        <p className="text-muted-foreground mt-1">Earn stable yield on your deposits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Deposit Card */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Deposit & Earn</h3>
              <p className="text-muted-foreground text-sm">Deposit USDC to earn yield from oil market activity</p>
            </div>
            <div className="bg-uae-green/20 text-uae-green px-4 py-2 rounded-full font-bold text-lg">{apy}% APY</div>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Deposit Amount</span>
                <span className="text-sm text-muted-foreground">Balance: $0.00</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">$</span>
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    $
                  </div>
                  <span className="font-medium text-foreground">USDC</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
            </div>

            <div className="bg-gold/10 rounded-xl p-4 border border-gold/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Estimated Annual Earnings</span>
                <span className="text-sm text-gold font-medium">@ {apy}% APY</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gold">
                  ${earnedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-muted-foreground">/year</span>
              </div>
            </div>

            <Button
              className="w-full bg-gold hover:bg-gold-dark text-dark-charcoal font-semibold py-6 text-lg"
              onClick={() => setIsWalletModalOpen(true)}
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet to Deposit
            </Button>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-gold" />
              </div>
              <span className="text-muted-foreground">Total Value Locked</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${tvl.toLocaleString()}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-uae-green/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-uae-green" />
              </div>
              <span className="text-muted-foreground">Your Deposits</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${yourDeposit.toLocaleString()}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gold" />
              </div>
              <span className="text-muted-foreground">Lock Period</span>
            </div>
            <p className="text-2xl font-bold text-foreground">None</p>
            <p className="text-sm text-muted-foreground">Withdraw anytime</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-8 bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">How the Vault Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gold text-dark-charcoal font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Deposit USDC</h4>
              <p className="text-sm text-muted-foreground">Deposit any amount of USDC into the vault</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gold text-dark-charcoal font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Earn 3.5% APY</h4>
              <p className="text-sm text-muted-foreground">Your deposits earn yield from market maker activity</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gold text-dark-charcoal font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Withdraw Anytime</h4>
              <p className="text-sm text-muted-foreground">No lock period - withdraw your funds whenever you want</p>
            </div>
          </div>
        </div>
      </div>

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  )
}
