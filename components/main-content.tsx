"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface MainContentProps {
  hasSession: boolean
  children: React.ReactNode
}

export function MainContent({ hasSession, children }: MainContentProps) {
  const pathname = usePathname()
  const isVitrinePage = pathname.startsWith("/vitrine/")

  return (
    <main
      className={cn(
        "min-h-screen",
        hasSession && !isVitrinePage && "ml-[80px] md:ml-[280px] transition-all duration-300",
      )}
    >
      {children}
    </main>
  )
}

