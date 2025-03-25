"use client"

import { useState, useEffect } from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import {
  BarChart2,
  Home,
  Users,
  Settings,
  ShieldAlert,
  Database,
  Store,
  Package,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  HeadphonesIcon,
  Sun,
  Moon,
  Loader2,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
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

  // Itens de navegação específicos para administradores
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Usuários", href: "/admin/usuarios" },
    { icon: Store, label: "Lojas", href: "/admin/lojas" },
    { icon: Package, label: "Produtos", href: "/admin/produtos" },
    { icon: FileText, label: "Panfletos", href: "/admin/panfletos" },
    { icon: Database, label: "Planos", href: "/admin/planos" },
    { icon: ShieldAlert, label: "Permissões", href: "/admin/permissoes" },
    { icon: Settings, label: "Configurações", href: "/admin/configuracoes" },
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
                  <NextLink href="/admin">
                    {isLoading ? (
                      <div className="flex items-center h-10">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">Admin Panel</span>
                        <span className="text-xs text-muted-foreground">{session?.user?.name || "Administrador"}</span>
                      </div>
                    )}
                  </NextLink>
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
                  <NextLink href="/admin">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 font-bold">A</span>
                    </div>
                  </NextLink>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 ml-auto hover:bg-red-50 dark:hover:bg-red-900"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </Button>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href)

              return (
                <motion.div key={item.href} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <NextLink
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 font-medium"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                    )}
                    title={collapsed ? item.label : ""}
                  >
                    <item.icon className="h-5 w-5 opacity-70 flex-shrink-0" />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NextLink>
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
              className={cn(
                "w-full flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900",
                "hover:text-red-600 dark:hover:text-red-400",
                collapsed && "justify-center p-2",
              )}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!collapsed && <span>Mudar Tema</span>}
            </Button>

            {/* Support Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full flex items-center gap-2 text-sm",
                    "hover:bg-red-50 dark:hover:bg-red-900",
                    "hover:text-red-600 dark:hover:text-red-400",
                    collapsed && "justify-center p-2",
                  )}
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
                <NextLink href="/admin/logs" passHref>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <BarChart2 className="h-4 w-4" />
                    <span>Logs do Sistema</span>
                  </DropdownMenuItem>
                </NextLink>
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

