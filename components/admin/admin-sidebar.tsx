"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  BarChart2,
  Users,
  Store,
  Settings,
  Database,
  Shield,
  Home,
  Calendar,
  LineChart,
  User,
  ShieldAlert,
  Package,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Headphones,
  FileText,
  BarChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  // Aguardar a montagem do componente para evitar problemas de hidratação
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("adminSidebarCollapsed")
      if (storedState !== null) {
        setCollapsed(storedState === "true")
      }
      setMounted(true)
    }
  }, [])

  // Salvar o estado de colapso da sidebar no localStorage
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("adminSidebarCollapsed", collapsed.toString())
    }
  }, [collapsed, mounted])

  const routes = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/admin",
    },
    {
      href: "/admin/usuarios",
      label: "Usuários",
      icon: Users,
      active: pathname === "/admin/usuarios",
    },
    {
      href: "/admin/lojas",
      label: "Lojas",
      icon: Store,
      active: pathname === "/admin/lojas",
    },
    {
      href: "/admin/produtos",
      label: "Produtos",
      icon: Package,
      active: pathname === "/admin/produtos",
    },
    {
      href: "/admin/panfletos",
      label: "Panfletos",
      icon: FileText,
      active: pathname === "/admin/panfletos",
    },
    {
      href: "/admin/eventos",
      label: "Eventos",
      icon: Calendar,
      active: pathname.includes("/admin/eventos"),
    },
    {
      href: "/admin/metricas",
      label: "Métricas",
      icon: BarChart,
      active: pathname === "/admin/metricas",
    },
    {
      href: "/admin/metricas-evento",
      label: "Métricas de Eventos",
      icon: LineChart,
      active: pathname === "/admin/metricas-evento",
    },
    {
      href: "/admin/planos",
      label: "Planos",
      icon: Database,
      active: pathname === "/admin/planos",
    },
    {
      href: "/admin/permissoes",
      label: "Permissões",
      icon: ShieldAlert,
      active: pathname === "/admin/permissoes",
    },
    {
      href: "/admin/configuracoes",
      label: "Configurações",
      icon: Settings,
      active: pathname === "/admin/configuracoes",
    },
    {
      href: "/admin/seguranca",
      label: "Segurança",
      icon: Shield,
      active: pathname === "/admin/seguranca",
    },
    {
      href: "/admin/perfil",
      label: "Meu Perfil",
      icon: User,
      active: pathname === "/admin/perfil",
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Overlay para mobile */}
      {!collapsed && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setCollapsed(true)} />}

      <aside
        className={cn(
          "flex flex-col border-r fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[240px]",
          className,
        )}
        style={{
          backgroundColor: "#0A1122", // Cor de fundo azul escuro
        }}
      >
        <div className="flex justify-between items-center h-16 px-4 border-b border-blue-900/50">
          {!collapsed ? (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white">FletoAds</span>
              <span className="text-xs text-gray-400">{session?.user?.name || "Administrador"}</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="space-y-1 flex-1 p-2 overflow-y-auto">
          {routes.map((route) => {
            const isActive = pathname === route.href || pathname.startsWith(route.href)

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-blue-900/50 text-white font-medium"
                    : "text-gray-400 hover:bg-blue-900/30 hover:text-white",
                  collapsed && "justify-center py-2.5",
                )}
                title={collapsed ? route.label : ""}
              >
                <route.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{route.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-blue-900/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full border-gray-700 bg-transparent text-gray-300 hover:bg-blue-900/30 hover:text-white",
                  collapsed ? "justify-center" : "justify-start gap-2",
                )}
              >
                <Headphones className="h-5 w-5" />
                {!collapsed && <span>Suporte</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Documentação</span>
              </DropdownMenuItem>
              <Link href="/admin/logs" passHref>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <BarChart2 className="h-4 w-4" />
                  <span>Logs do Sistema</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Espaçador para compensar a sidebar fixa */}
      <div className={cn("flex-shrink-0", collapsed ? "w-[70px]" : "w-[240px]")} />
    </>
  )
}
