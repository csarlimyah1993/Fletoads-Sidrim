"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  X,
  ChevronRight,
  Settings,
  DollarSign,
  Layers,
  ImageIcon,
  Search,
  MessageSquare,
  BarChart,
  Home,
  ShoppingBag,
  Users,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface VitrineSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function VitrineSidebar({ open, setOpen }: VitrineSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")
  const [activeItem, setActiveItem] = useState("detalhes")

  // Determine if we're in product detail mode or general navigation mode
  const isProductDetailMode = pathname?.includes("/vitrine/produto/")

  useEffect(() => {
    // Resetar o item ativo quando o sidebar é fechado
    if (!open) {
      setActiveItem("detalhes")
    }
  }, [open])

  const handleItemClick = (item: string) => {
    if (isProductDetailMode) {
      setActiveItem(item)
      router.push(`/vitrine/produto/${item}`, { scroll: false })
    }
  }

  // Product detail menu items
  const productMenuItems = [
    { id: "detalhes", label: "Detalhes do produto", icon: Settings },
    { id: "precos", label: "Preços e estoque", icon: DollarSign },
    { id: "variacoes", label: "Variações", icon: Layers },
    { id: "imagens", label: "Imagens", icon: ImageIcon },
    { id: "seo", label: "SEO", icon: Search },
    { id: "avaliacoes", label: "Avaliações", icon: MessageSquare },
    { id: "estatisticas", label: "Estatísticas", icon: BarChart },
  ]

  // General navigation items
  const navItems = [
    { href: "/vitrine", icon: Home, label: "Início" },
    { href: "/vitrine/produtos", icon: ShoppingBag, label: "Produtos" },
    { href: "/vitrine/clientes", icon: Users, label: "Clientes" },
    { href: "/vitrine/estatisticas", icon: BarChart, label: "Estatísticas" },
    { href: "/vitrine/mensagens", icon: MessageSquare, label: "Mensagens" },
    { href: "/vitrine/configuracoes", icon: Settings, label: "Configurações" },
  ]

  const sidebarVariants = {
    open: {
      x: 0,
      width: 280,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: -280,
      width: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setOpen(false)} />}

      <motion.div
        initial={false}
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed top-0 left-0 h-screen bg-white border-r z-20 overflow-hidden"
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{isProductDetailMode ? `Produto #${produtoId}` : "Vitrine"}</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-1">
            {isProductDetailMode
              ? // Product detail navigation
                productMenuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeItem === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeItem === item.id ? "bg-blue-600 text-white hover:bg-blue-700" : ""
                    }`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                ))
              : // General navigation
                navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href ? "bg-blue-600 text-white hover:bg-blue-700" : "",
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
          </div>

          <div className="mt-auto">
            <Separator className="my-4" />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setOpen(false)
                if (isProductDetailMode) {
                  router.push("/vitrine/produtos")
                }
              }}
            >
              {isProductDetailMode ? "Voltar para produtos" : "Fechar menu"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 lg:hidden shadow-md"
        onClick={() => setOpen(!open)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  )
}
