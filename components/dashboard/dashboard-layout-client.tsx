"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { cn } from "@/lib/utils"

interface DashboardLayoutClientProps {
  children: React.ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Verificar se estamos em uma página de vitrine ou admin
  const isVitrinePage = pathname.startsWith("/vitrine/")
  const isAdminPage = pathname.startsWith("/admin")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isVitrinePage && !isAdminPage && (
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8" style={{ marginLeft: "16rem" }}>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">
                {pathname === "/dashboard"
                  ? "Dashboard"
                  : pathname.startsWith("/dashboard/clientes")
                    ? "Clientes"
                    : pathname.startsWith("/dashboard/campanhas")
                      ? "Campanhas"
                      : pathname.startsWith("/dashboard/panfletos")
                        ? "Panfletos"
                        : pathname.startsWith("/dashboard/produtos")
                          ? "Produtos"
                          : pathname.startsWith("/dashboard/perfil-da-loja")
                            ? "Perfil da Loja"
                            : pathname.startsWith("/dashboard/vitrine")
                              ? "Vitrine"
                              : pathname.startsWith("/dashboard/pan-ai")
                                ? "PanAI"
                                : pathname.startsWith("/dashboard/integracoes")
                                  ? "Integrações"
                                  : pathname.startsWith("/dashboard/perfil")
                                    ? "Perfil"
                                    : "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsDropdown />
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-1">
        <Sidebar />
        <main className={cn("flex-1 p-6", !isVitrinePage && !isAdminPage && "ml-64")}>{children}</main>
      </div>
    </div>
  )
}
