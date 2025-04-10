"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart2,
  Users,
  FileText,
  Package,
  Store,
  MessageSquare,
  Link2,
  Phone,
  ChevronLeft,
  ChevronRight,
  Headphones,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean
}

export function NewSidebar({ className, defaultCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
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
      href: "/dashboard/whatsapp",
      icon: Phone,
    },
  ]

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r transition-width duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[240px]",
        className,
      )}
      style={{
        transitionProperty: "width",
        transitionDuration: "300ms",
        transitionTimingFunction: "ease-in-out",
        backgroundColor: "#0A1122", // Cor de fundo azul escuro
      }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed ? (
          <h1 className="text-xl font-bold text-white">FletoAds</h1>
        ) : (
          <h1 className="text-xl font-bold text-white">F</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-blue-900/50 text-white font-medium"
                    : "text-gray-400 hover:bg-blue-900/30 hover:text-white",
                  isCollapsed && "justify-center py-2.5",
                )}
              >
                <item.icon className={cn("h-5 w-5", isCollapsed && "h-5 w-5")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className={cn(
            "w-full border-gray-700 bg-transparent text-gray-300 hover:bg-blue-900/30 hover:text-white",
            isCollapsed ? "justify-center" : "justify-start gap-2",
          )}
          asChild
        >
          <Link href="/suporte">
            <Headphones className="h-5 w-5" />
            {!isCollapsed && <span>Suporte</span>}
          </Link>
        </Button>
      </div>
    </div>
  )
}
