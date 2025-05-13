"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { ThemeToggle } from "@/components/vitrine/theme-toggle" // Usando o caminho correto
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/" aria-label="Voltar para a página inicial">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </ThemeProvider>
  )
}
