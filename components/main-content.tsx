"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface MainContentProps {
  hasSession: boolean
  children: React.ReactNode
}

export function MainContent({ hasSession, children }: MainContentProps) {
  const pathname = usePathname()
  const isVitrinePage = pathname.startsWith("/vitrine/")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Detectar o estado da sidebar do localStorage
  useEffect(() => {
    const checkSidebarState = () => {
      const storedState = localStorage.getItem("sidebarCollapsed")
      if (storedState !== null) {
        setSidebarCollapsed(storedState === "true")
      }
    }

    // Verificar o estado inicial
    checkSidebarState()

    // Configurar um listener para mudanças no localStorage
    const handleStorageChange = () => {
      checkSidebarState()
    }

    window.addEventListener("storage", handleStorageChange)

    // Também podemos verificar periodicamente para garantir sincronização
    const interval = setInterval(checkSidebarState, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <main
      className={cn(
        "min-h-screen transition-all duration-300",
        hasSession && !isVitrinePage && (sidebarCollapsed ? "ml-[80px]" : "ml-[280px]"),
      )}
    >
      {children}
    </main>
  )
}

