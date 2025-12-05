"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletModalProps {
  className?: string
  fullWidth?: boolean
  buttonText?: string
}

// Custom ConnectButton wrapper that matches the app's design
export function WalletModal({ 
  className,
  fullWidth = false,
  buttonText = "Connect Wallet"
}: WalletModalProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
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
                      "bg-gold hover:bg-gold-dark text-dark-charcoal font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors",
                      fullWidth && "w-full py-6 text-lg",
                      className
                    )}
                  >
                    <Wallet className="h-4 w-4" />
                    {buttonText}
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-gold/10 hover:bg-gold/20 text-gold font-semibold px-3 py-2 rounded-lg text-sm border border-gold/30 flex items-center gap-2 transition-colors"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-gold hover:bg-gold-dark text-dark-charcoal font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
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
