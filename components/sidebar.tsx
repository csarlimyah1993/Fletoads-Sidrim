"use client"

import { useState, useEffect } from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import {
  BarChart2,
  Home,
  FileText,
  Store,
  MessageSquare,
  ShoppingBag,
  LinkIcon,
  Package,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  HeadphonesIcon,
  Sun,
  Moon,
  Loader2,
  Users,
  Settings,
  CreditCard,
  LineChart,
  Bell,
  Shield,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()
  const [loja, setLoja] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isAdmin = session?.user?.cargo === "admin"

  // Aguardar a montagem do componente para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Buscar dados da loja
  useEffect(() => {
    const fetchLoja = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/loja/perfil")

        if (response.ok) {
          const data = await response.json()
          setLoja(data)
        }
      } catch (error) {
        console.error("Erro ao buscar dados da loja:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user && !isAdmin) {
      fetchLoja()
    } else {
      setIsLoading(false)
    }
  }, [session, isAdmin])

  // Itens de navegação para usuários normais
  const regularNavItems = [
    { icon: Home, label: "Página Inicial", href: "/" },
    { icon: BarChart2, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingBag, label: "Vendas", href: "/dashboard/vendas" },
    { icon: FileText, label: "Panfletos", href: "/dashboard/panfletos" },
    { icon: Package, label: "Produtos", href: "/dashboard/produtos" },
    { icon: MessageSquare, label: "Ferramenta Pan AI", href: "/dashboard/pan-ai" },
    { icon: LinkIcon, label: "Integrações", href: "/dashboard/integracoes" },
    { icon: Store, label: "Perfil Da Loja", href: "/dashboard/perfil" },
  ]

  // Itens de navegação para administradores
  const adminNavItems = [
    { icon: Home, label: "Página Inicial", href: "/" },
    { icon: Shield, label: "Painel Admin", href: "/admin" },
    { icon: Users, label: "Usuários", href: "/admin/usuarios" },
    { icon: CreditCard, label: "Planos", href: "/admin/planos" },
    { icon: LineChart, label: "Métricas", href: "/admin/metricas" },
    { icon: Bell, label: "Notificações", href: "/admin/notificacoes" },
    { icon: Database, label: "Sistema", href: "/admin/sistema" },
    { icon: Settings, label: "Configurações", href: "/admin/configuracoes" },
  ]

  // Selecionar os itens de navegação com base no tipo de usuário
  const navItems = isAdmin ? adminNavItems : regularNavItems

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
          "flex flex-col border-r bg-background p-4 fixed top-0 left-0 h-screen z-40",
          "transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[240px]",
          isAdmin ? "border-r-violet-200 dark:border-r-violet-900" : "",
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
                  <NextLink href={isAdmin ? "/admin" : "/"}>
                    {isLoading ? (
                      <div className="flex items-center h-10">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span
                          className={cn("font-bold text-lg", isAdmin ? "text-violet-600 dark:text-violet-400" : "")}
                        >
                          {isAdmin ? "FletoAds Admin" : "FletoAds"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isAdmin ? "Painel Administrativo" : loja ? loja.nome : session?.user?.nome || ""}
                        </span>
                      </div>
                    )}
                  </NextLink>
                </motion.div>
              ) : (
                <motion.div
                  key="f-logo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mx-auto"
                >
                  <NextLink href={isAdmin ? "/admin" : "/"}>
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isAdmin ? "bg-violet-100 dark:bg-violet-900" : "bg-emerald-100 dark:bg-emerald-900",
                      )}
                    >
                      <span
                        className={cn(
                          "font-bold",
                          isAdmin ? "text-violet-600 dark:text-violet-400" : "text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {isAdmin ? "A" : "F"}
                      </span>
                    </div>
                  </NextLink>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "h-8 w-8 ml-auto",
                isAdmin
                  ? "hover:bg-violet-50 dark:hover:bg-violet-900"
                  : "hover:bg-emerald-50 dark:hover:bg-emerald-900",
              )}
            >
              {collapsed ? (
                <ChevronRight
                  className={cn(
                    "h-4 w-4",
                    isAdmin ? "text-violet-600 dark:text-violet-400" : "text-emerald-600 dark:text-emerald-400",
                  )}
                />
              ) : (
                <ChevronLeft
                  className={cn(
                    "h-4 w-4",
                    isAdmin ? "text-violet-600 dark:text-violet-400" : "text-emerald-600 dark:text-emerald-400",
                  )}
                />
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
                        ? isAdmin
                          ? "bg-violet-50 dark:bg-violet-900 text-violet-600 dark:text-violet-400 font-medium"
                          : "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium"
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
                "w-full flex items-center gap-2",
                isAdmin
                  ? "hover:bg-violet-50 dark:hover:bg-violet-900 hover:text-violet-600 dark:hover:text-violet-400"
                  : "hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:text-emerald-600 dark:hover:text-emerald-400",
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
                    isAdmin
                      ? "hover:bg-violet-50 dark:hover:bg-violet-900 hover:text-violet-600 dark:hover:text-violet-400"
                      : "hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:text-emerald-600 dark:hover:text-emerald-400",
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
                  <span>Pan Suporte Lojista</span>
                </DropdownMenuItem>
                <NextLink href="/tutorial" passHref>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4" />
                    <span>Tutorial Interativo</span>
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

