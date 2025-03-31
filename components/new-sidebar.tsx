"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
// Primeiro, importe o hook useTheme e os ícones necessários
import { useTheme } from "next-themes"
import {
  Moon,
  Sun,
  Home,
  BarChart3,
  ShoppingCart,
  FileText,
  Package,
  MessageSquareText,
  Link2,
  Store,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean
}

export function NewSidebar({ className, defaultCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const { setTheme, theme } = useTheme()

  // Verificar se estamos em uma página de vitrine ou admin
  const isVitrinePage = pathname.startsWith("/vitrine/")
  const isAdminPage = pathname.startsWith("/admin")

  // Restaurar o estado de colapso da sidebar do localStorage
  useEffect(() => {
    const storedState = localStorage.getItem("sidebarCollapsed")
    if (storedState !== null) {
      setIsCollapsed(storedState === "true")
    }
  }, [])

  // Salvar o estado de colapso da sidebar no localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString())

    // Disparar um evento de storage para notificar outros componentes
    window.dispatchEvent(new Event("storage"))
  }, [isCollapsed])

  // Não renderizar a sidebar em páginas de vitrine ou admin
  if (isVitrinePage || isAdminPage) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-background transition-width duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        className,
      )}
      style={{
        transitionProperty: "width",
        transitionDuration: "300ms",
        transitionTimingFunction: "ease-in-out",
      }}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          {isCollapsed ? (
            <span className="font-bold text-primary text-xl">F</span>
          ) : (
            <span className="font-bold text-xl">
              <span className="text-primary">fleto</span>
              <span className="text-green-500">ads</span>
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-3"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-2 px-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname === "/dashboard" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <Home className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span>Página Inicial</span>}
            {isCollapsed && <span>Início</span>}
          </Link>
          <Link
            href="/dashboard/estatisticas"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname === "/dashboard/estatisticas"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <BarChart3 className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span>Dashboard</span>}
            {isCollapsed && <span>Stats</span>}
          </Link>
          <Link
            href="/dashboard/vendas"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname === "/dashboard/vendas"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <ShoppingCart className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span>Vendas</span>}
            {isCollapsed && <span>Vendas</span>}
          </Link>
          <Link
            href="/dashboard/panfletos"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname === "/dashboard/panfletos"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <FileText className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span>Panfletos</span>}
            {isCollapsed && <span>Panfletos</span>}
          </Link>
          <Link
            href="/dashboard/produtos"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname === "/dashboard/produtos"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <Package className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span>Produtos</span>}
            {isCollapsed && <span>Produtos</span>}
          </Link>
          <Link
            href="/dashboard/pan-ai"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname === "/dashboard/pan-ai"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <MessageSquareText className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span>Ferramenta Pan AI</span>}
            {isCollapsed && <span>Pan AI</span>}
          </Link>
          <Link
            href="/dashboard/integracoes"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname === "/dashboard/integracoes"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <Link2 className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span>Integrações</span>}
            {isCollapsed && <span>Integrar</span>}
          </Link>
          <Link
            href="/dashboard/perfil-da-loja"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname.includes("/perfil-da-loja")
                ? "bg-green-500/20 text-green-500 font-medium"
                : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <Store
              className={cn(
                "h-5 w-5",
                isCollapsed && "h-6 w-6",
                pathname.includes("/perfil-da-loja") && "text-green-500",
              )}
            />
            {!isCollapsed && <span>Perfil Da Loja</span>}
            {isCollapsed && <span>Loja</span>}
          </Link>
          <Link
            href="/dashboard/vitrine"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-accent",
              pathname.includes("/vitrine") ? "bg-green-500/20 text-green-500 font-medium" : "text-muted-foreground",
              isCollapsed && "flex-col justify-center gap-1 py-3 text-xs",
            )}
          >
            <Store
              className={cn("h-5 w-5", isCollapsed && "h-6 w-6", pathname.includes("/vitrine") && "text-green-500")}
            />
            {!isCollapsed && <span>Personalizar Vitrine</span>}
            {isCollapsed && <span>Vitrine</span>}
          </Link>
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="flex flex-col gap-4">
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/suporte">
              <HelpCircle className="h-5 w-5" />
              {!isCollapsed && <span>Suporte</span>}
            </Link>
          </Button>

          {isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Alternar tema"
              className="w-full flex justify-center"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          ) : (
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/configuracoes">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Configurações</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Alternar tema"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

