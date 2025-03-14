"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { X, ChevronRight, Settings, DollarSign, Layers, Image, Search, MessageSquare, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface VitrineSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function VitrineSidebar({ open, setOpen }: VitrineSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")
  const [activeItem, setActiveItem] = useState("detalhes")

  useEffect(() => {
    // Resetar o item ativo quando o sidebar é fechado
    if (!open) {
      setActiveItem("detalhes")
    }
  }, [open])

  const handleItemClick = (item: string) => {
    setActiveItem(item)
    router.push(`/vitrine/produto/${item}`, { scroll: false })
  }

  const menuItems = [
    { id: "detalhes", label: "Detalhes do produto", icon: Settings },
    { id: "precos", label: "Preços e estoque", icon: DollarSign },
    { id: "variacoes", label: "Variações", icon: Layers },
    { id: "imagens", label: "Imagens", icon: Image },
    { id: "seo", label: "SEO", icon: Search },
    { id: "avaliacoes", label: "Avaliações", icon: MessageSquare },
    { id: "estatisticas", label: "Estatísticas", icon: BarChart },
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
    <motion.div
      initial={false}
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed top-0 left-0 h-screen bg-white border-r z-20 overflow-hidden"
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Produto #{produtoId}</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-1">
          {menuItems.map((item) => (
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
          ))}
        </div>

        <div className="mt-auto">
          <Separator className="my-4" />
          <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
            Voltar para produtos
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

