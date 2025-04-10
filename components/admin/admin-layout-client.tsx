"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { UserNav } from "@/components/user-nav"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ModeToggle } from "@/components/mode-toggle"

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handleStorageChange = () => {
      const storedState = localStorage.getItem("adminSidebarCollapsed")
      if (storedState !== null) {
        setSidebarCollapsed(storedState === "true")
      }
    }

    // Verificar o estado inicial
    handleStorageChange()

    // Adicionar listener para mudanças no localStorage
    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div
          className="flex h-16 items-center justify-between py-4 px-4"
          style={{
            marginLeft: sidebarCollapsed ? "70px" : "240px",
            transition: "margin-left 300ms ease-in-out",
          }}
        >
          <h1 className="text-xl font-bold">FletoAds Admin</h1>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <main
          className="flex-1 p-6"
          style={{
            marginLeft: sidebarCollapsed ? "70px" : "240px",
            transition: "margin-left 300ms ease-in-out",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
