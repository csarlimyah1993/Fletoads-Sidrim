import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NewSidebar } from "@/components/new-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SessionProvider } from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FletoAds - Plataforma de Marketing Digital",
  description: "Crie e gerencie seus panfletos digitais e produtos com facilidade",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {session && <NewSidebar />}
            <main className={session ? "ml-[80px] md:ml-[280px] transition-all duration-300 min-h-screen" : ""}>
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

