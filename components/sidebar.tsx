"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart2,
  Users,
  FileText,
  Package,
  Store,
  MessageSquare,
  Link2,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Verificar se estamos em uma página de vitrine ou admin
  const isVitrinePage = pathname.startsWith("/vitrine/")
  const isAdminPage = pathname.startsWith("/admin")

  // Restaurar o estado de colapso da sidebar do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("sidebarCollapsed")
      if (storedState !== null) {
        setIsCollapsed(storedState === "true")
      }
      setMounted(true)
    }
  }, [])

  // Salvar o estado de colapso da sidebar no localStorage
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", isCollapsed.toString())

      // Disparar um evento personalizado para notificar outras partes da aplicação
      const event = new Event("sidebarToggle")
      window.dispatchEvent(event)

      // Atualizar a margem do conteúdo principal
      const mainContent = document.getElementById("main-content")
      if (mainContent) {
        if (isCollapsed) {
          mainContent.style.marginLeft = "70px"
        } else {
          mainContent.style.marginLeft = "16rem" // 64 * 0.25 = 16rem
        }
      }
    }
  }, [isCollapsed, mounted])

  // Não renderizar a sidebar em páginas de vitrine ou admin
  if (isVitrinePage || isAdminPage) {
    return null
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart2,
      exact: true, // Apenas ativo quando o caminho for exatamente /dashboard
    },
    {
      name: "Clientes",
      href: "/dashboard/clientes",
      icon: Users,
    },
    {
      name: "Campanhas",
      href: "/dashboard/campanhas",
      icon: FileText,
    },
    {
      name: "Panfletos",
      href: "/dashboard/panfletos",
      icon: FileText,
    },
    {
      name: "Produtos",
      href: "/dashboard/produtos",
      icon: Package,
    },
    {
      name: "Perfil da Loja",
      href: "/dashboard/perfil-da-loja",
      icon: Store,
    },
    {
      name: "Vitrine",
      href: "/dashboard/vitrine",
      icon: Store,
    },
    {
      name: "PanAI",
      href: "/dashboard/pan-ai",
      icon: MessageSquare,
    },
    {
      name: "Integrações",
      href: "/dashboard/integracoes",
      icon: Link2,
    },
    {
      name: "WhatsApp",
      href: "/dashboard/integracoes/whatsapp",
      icon: Phone,
    },
  ]

  return (
    <div
      data-sidebar
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-64",
        className,
      )}
      style={{
        backgroundColor: "#0A0E17", // Fundo muito escuro, quase preto
      }}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
        {!isCollapsed ? (
          <h1 className="text-xl font-bold text-white">FletoAds</h1>
        ) : (
          <h1 className="text-xl font-bold text-white">F</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto">
        {menuItems.map((item) => {
          // Verifica se o item deve ser ativo apenas quando o caminho for exato
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== "/dashboard"

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-3 text-sm transition-colors",
                isActive
                  ? "bg-gray-800/80 text-white font-medium"
                  : "text-gray-300 hover:bg-gray-800/50 hover:text-white",
                isCollapsed && "justify-center",
              )}
            >
              <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
