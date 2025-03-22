"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Moon,
  Sun,
  Home,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Package,
  MessageSquareText,
  Link2,
  Store,
  Palette,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

  // Restaurar o estado de colapso da sidebar do localStorage
  useEffect(() => {
    const storedState = localStorage.getItem("sidebarCollapsed")
    if (storedState !== null) {
      setCollapsed(storedState === "true")
    }
  }, [])

  // Salvar o estado de colapso da sidebar no localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed.toString())
  }, [collapsed])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const menuItems = [
    {
      title: "Página Inicial",
      href: "/",
      icon: Home,
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Vendas",
      href: "/dashboard/vendas",
      icon: ShoppingCart,
    },
    {
      title: "Panfletos",
      href: "/dashboard/panfletos",
      icon: FileText,
    },
    {
      title: "Produtos",
      href: "/dashboard/produtos",
      icon: Package,
    },
    {
      title: "Ferramenta Pan AI",
      href: "/dashboard/pan-ai",
      icon: MessageSquareText,
    },
    {
      title: "Integrações",
      href: "/dashboard/integracoes",
      icon: Link2,
    },
    {
      title: "Perfil Da Loja",
      href: "/dashboard/perfil-da-loja",
      icon: Store,
      highlight: true,
    },
    {
      title: "Personalizar Vitrine",
      href: "/dashboard/vitrine",
      icon: Palette,
      highlight: true,
    },
  ]

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col bg-black transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        <Link href="/" className="flex items-center">
          {collapsed ? (
            <span className="text-xl font-bold">
              <span className="text-blue-500">f</span>
              <span className="text-green-500">a</span>
            </span>
          ) : (
            <span className="text-xl font-bold">
              <span className="text-blue-500">fleto</span>
              <span className="text-green-500">ads</span>
            </span>
          )}
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-400 hover:text-white">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? item.highlight
                    ? "bg-green-500/20 text-green-500"
                    : "bg-blue-500/20 text-blue-500"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
                collapsed && "justify-center px-2",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  item.highlight && pathname === item.href && "text-green-500",
                  !item.highlight && pathname === item.href && "text-blue-500",
                )}
              />
              {!collapsed && <span className="ml-3">{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-800 p-4">
        <Link
          href="/suporte"
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white",
            collapsed && "justify-center px-2",
          )}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Suporte</span>}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn("mt-2 text-gray-400 hover:bg-gray-800 hover:text-white", collapsed ? "w-full" : "ml-2")}
          aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="mt-4 flex items-center">
          <div className="relative h-8 w-8 rounded-full bg-gray-700 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">U</div>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Usuário</p>
              <p className="text-xs text-gray-400">usuario@exemplo.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

