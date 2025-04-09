"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import {
  BarChart3,
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
  HeadphonesIcon,
  Sun,
  Moon,
  Loader2,
  FileText,
  BarChart2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  // Aguardar a montagem do componente para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Restaurar o estado de colapso da sidebar do localStorage
  useEffect(() => {
    const storedState = localStorage.getItem("adminSidebarCollapsed")
    if (storedState !== null) {
      setCollapsed(storedState === "true")
    }
  }, [])

  // Salvar o estado de colapso da sidebar no localStorage
  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", collapsed.toString())
  }, [collapsed])

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
      icon: BarChart3,
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

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 70 : 240,
        }}
        className={cn(
          "flex flex-col border-r bg-background p-4 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40",
          "transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[240px]",
          className,
        )}
      >
        <div className="mb-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="full-logo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/admin">
                    {isLoading ? (
                      <div className="flex items-center h-10">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">
                          <span className="text-primary">fleto</span>
                          <span className="text-green-500">ads</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{session?.user?.name || "Administrador"}</span>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="a-logo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mx-auto"
                >
                  <Link href="/admin">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">F</span>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 ml-auto">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="space-y-1 flex-1">
            {routes.map((route) => {
              const isActive = pathname === route.href || pathname.startsWith(route.href)

              return (
                <motion.div key={route.href} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent",
                      collapsed && "justify-center py-3",
                    )}
                    title={collapsed ? route.label : ""}
                  >
                    <route.icon className="h-5 w-5 flex-shrink-0" />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {route.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <div className="pt-4 mt-auto space-y-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn("w-full flex items-center gap-2", collapsed && "justify-center p-2")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!collapsed && <span>Mudar Tema</span>}
            </Button>

            {/* Support Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full flex items-center gap-2 text-sm", collapsed && "justify-center p-2")}
                >
                  <HeadphonesIcon className="h-4 w-4" />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      Suporte
                    </motion.span>
                  )}
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
        </div>
      </motion.aside>

      {/* Espaçador para compensar a sidebar fixa */}
      <div className={cn("flex-shrink-0", collapsed ? "w-[70px]" : "w-[240px]")} />
    </>
  )
}

