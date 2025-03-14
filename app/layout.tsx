import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileNav } from "@/components/mobile-nav"
import { AssistenteVirtual } from "@/components/assistente-virtual"
import "@/app/globals.css"

export const metadata = {
  title: "Panfletex Dashboard",
  description: "Dashboard para gerenciamento de panfletos e vitrines digitais",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex min-h-screen flex-col transition-all duration-300">
            <MobileNav />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 md:ml-[240px] transition-all duration-300 w-full">
                {children}
                <AssistenteVirtual />
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'