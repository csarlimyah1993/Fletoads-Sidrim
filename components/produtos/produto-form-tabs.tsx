"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { CircleIcon as CircleInfo, Tag, ImageIcon, DollarSign, Settings, Truck } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface ProdutoFormTabsProps {
  tipoProduto?: string
}

export function ProdutoFormTabs({ tipoProduto = "fisico" }: ProdutoFormTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("informacoes")

  // Obter a aba ativa da URL
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Função para atualizar a URL com a aba selecionada
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams],
  )

  // Função para navegar para uma aba
  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    router.push(`${pathname}?${createQueryString("tab", tab)}`)
  }

  return (
    <div className="w-full border rounded-lg p-1 mb-6 flex flex-wrap">
      <TabButton
        active={activeTab === "informacoes"}
        onClick={() => handleTabClick("informacoes")}
        icon={<CircleInfo className="h-4 w-4 mr-2" />}
        label="Informações Básicas"
      />
      <TabButton
        active={activeTab === "preco"}
        onClick={() => handleTabClick("preco")}
        icon={<DollarSign className="h-4 w-4 mr-2" />}
        label="Preço e Estoque"
      />
      <TabButton
        active={activeTab === "midia"}
        onClick={() => handleTabClick("midia")}
        icon={<ImageIcon className="h-4 w-4 mr-2" />}
        label="Mídia"
      />
      <TabButton
        active={activeTab === "categorizacao"}
        onClick={() => handleTabClick("categorizacao")}
        icon={<Tag className="h-4 w-4 mr-2" />}
        label="Categorização"
      />
      {tipoProduto === "fisico" && (
        <TabButton
          active={activeTab === "envio"}
          onClick={() => handleTabClick("envio")}
          icon={<Truck className="h-4 w-4 mr-2" />}
          label="Envio"
        />
      )}
      <TabButton
        active={activeTab === "configuracoes"}
        onClick={() => handleTabClick("configuracoes")}
        icon={<Settings className="h-4 w-4 mr-2" />}
        label="Configurações"
      />
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
