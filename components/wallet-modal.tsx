"use client"

import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletModalProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
  fullWidth?: boolean
  buttonText?: string
}

// Custom ConnectButton wrapper that matches the app's design
export function WalletModal({ 
  isOpen, 
  onClose, 
  className,
  fullWidth = false,
  buttonText = "Connect Wallet"
}: WalletModalProps) {
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()

  // If wallet is connected, show address/account info
  if (isConnected && address) {
    return (
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted
          const connected = ready && account && chain

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
              className={cn("flex items-center gap-2", fullWidth && "w-full flex-col")}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className={cn(
                        "bg-gold hover:bg-gold-dark text-dark-charcoal font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2",
                        fullWidth && "w-full py-6 text-lg",
                        className
                      )}
                    >
                      <Wallet className="h-4 w-4" />
                      {buttonText}
                    </button>
                  )
                }

                return (
                  <>
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="bg-gold/10 hover:bg-gold/20 text-gold font-semibold px-3 py-2 rounded-lg text-sm border border-gold/30 flex items-center gap-2"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: "hidden",
                            display: "inline-block",
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-gold hover:bg-gold-dark text-dark-charcoal font-semibold px-4 py-2 rounded-lg"
                    >
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </button>
                  </>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
    )
  }

  // If not connected, show connect button
  return (
    <button
      onClick={openConnectModal}
      type="button"
      className={cn(
        "bg-gold hover:bg-gold-dark text-dark-charcoal font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2",
        fullWidth && "w-full py-6 text-lg",
        className
      )}
    >
      <Wallet className="h-4 w-4" />
      {buttonText}
    </button>
  )
}
