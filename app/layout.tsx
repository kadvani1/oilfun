import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import { FloatingAudioButton } from "@/components/floating-audio-button"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Oil.fun - Energy Prediction Markets",
  description: "Decentralized prediction markets for oil prices, OPEC decisions, and energy markets on BNB Chain",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <FloatingAudioButton />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
