"use client"

import { X } from "lucide-react"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

const wallets = [
  {
    name: "MetaMask",
    icon: "🦊",
    description: "Connect to your MetaMask wallet",
  },
  {
    name: "WalletConnect",
    icon: "🔗",
    description: "Scan with WalletConnect",
  },
  {
    name: "Coinbase Wallet",
    icon: "💼",
    description: "Connect to Coinbase Wallet",
  },
  {
    name: "Trust Wallet",
    icon: "🛡️",
    description: "Connect to Trust Wallet",
  },
  {
    name: "Phantom",
    icon: "👻",
    description: "Connect to Phantom wallet",
  },
]

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-foreground mb-2">Connect Wallet</h2>
        <p className="text-muted-foreground mb-6">Choose your preferred wallet to connect</p>

        {/* Wallet Options */}
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-gold bg-card hover:bg-gold/5 transition-all group"
              onClick={() => {
                // Handle wallet connection
                console.log(`Connecting to ${wallet.name}`)
                onClose()
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl group-hover:bg-gold/20 transition-colors">
                {wallet.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-foreground">{wallet.name}</div>
                <div className="text-sm text-muted-foreground">{wallet.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
