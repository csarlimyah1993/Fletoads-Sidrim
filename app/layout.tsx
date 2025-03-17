import type React from "react"
import { Providers } from "./providers"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { WhatsAppButton } from "@/components/whatsapp-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fletoads - Sistema de Gestão de Panfletos",
  description: "Plataforma para criação e gestão de campanhas de panfletos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  )
}

