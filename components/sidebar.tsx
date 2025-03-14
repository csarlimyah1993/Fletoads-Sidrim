"use client"

import { useState } from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
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
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { icon: Home, label: "Página Inicial", href: "/" },
    { icon: BarChart2, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingBag, label: "Vendas", href: "/vendas" },
    { icon: FileText, label: "Panfletos", href: "/panfletos" },
    { icon: Package, label: "Produtos", href: "/produtos" },
    { icon: MessageSquare, label: "Ferramenta Pan AI", href: "/pan-ai" },
    { icon: LinkIcon, label: "Integrações", href: "/integracoes" },
    { icon: ShoppingCart, label: "Marketplace", href: "/marketplace" },
    { icon: Store, label: "Perfil Da Loja", href: "/perfil" },
  ]

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 70 : 240,
      }}
      className={cn(
        "flex-col border-r bg-white p-4 hidden md:flex transition-all duration-300 fixed top-0 h-screen z-10",
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
                <NextLink href="/">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-semibold text-xl">fleto</span>
                    <span className="text-emerald-600 font-semibold text-xl">ads</span>
                  </div>
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
                <NextLink href="/">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold">F</span>
                  </div>
                </NextLink>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 ml-auto hover:bg-emerald-50"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-emerald-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-emerald-600" />
            )}
          </Button>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

            return (
              <motion.div key={item.href} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <NextLink
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-emerald-50 text-emerald-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
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
        <div className="pt-4 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full flex items-center gap-2 text-sm hover:bg-emerald-50 hover:text-emerald-600",
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
  )
}

