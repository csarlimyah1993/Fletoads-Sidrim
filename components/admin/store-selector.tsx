"use client"

// Vamos substituir completamente o componente para garantir que a pesquisa funcione corretamente

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, ChevronDown, Store, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface Loja {
  _id: string
  nome: string
  logo?: string
  ativo?: boolean
}

interface StoreSelectorProps {
  selectedStores: string[]
  onStoreToggle: (storeId: string, selected: boolean) => void
  className?: string
}

export function StoreSelector({ selectedStores, onStoreToggle, className }: StoreSelectorProps) {
  const [open, setOpen] = useState(false)
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchLojas = async () => {
      try {
        setLoading(true)
        const baseUrl = window.location.origin
        const response = await fetch(`${baseUrl}/api/admin/lojas`)
        if (!response.ok) throw new Error("Falha ao buscar lojas")

        const data = await response.json()
        setLojas(data.lojas || [])
      } catch (error) {
        console.error("Erro ao buscar lojas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLojas()
  }, [])

  // Filter stores based on search query - case insensitive
  const filteredLojas = lojas.filter((loja) => {
    if (!searchQuery.trim()) return true

    // Normalizar texto para pesquisa (remover acentos, converter para minúsculas)
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    }

    const normalizedQuery = normalizeText(searchQuery)
    const normalizedNome = normalizeText(loja.nome)

    return normalizedNome.includes(normalizedQuery)
  })

  // Function to handle store selection
  const handleStoreSelect = (lojaId: string) => {
    const isSelected = selectedStores.includes(lojaId)
    onStoreToggle(lojaId, !isSelected)
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span>
                {selectedStores.length === 0
                  ? "Selecionar lojas..."
                  : `${selectedStores.length} ${selectedStores.length === 1 ? "loja selecionada" : "lojas selecionadas"}`}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            {loading ? (
              <div className="py-6 text-center">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando lojas...</p>
              </div>
            ) : filteredLojas.length === 0 ? (
              <div className="py-6 text-center text-sm">Nenhuma loja encontrada.</div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="p-1">
                  {filteredLojas.map((loja) => {
                    const isSelected = selectedStores.includes(loja._id)
                    return (
                      <div
                        key={loja._id}
                        className={cn(
                          "flex items-center gap-2 py-3 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm",
                          loja.ativo === false && "opacity-50 cursor-not-allowed",
                          isSelected && "bg-accent text-accent-foreground",
                        )}
                        onClick={() => {
                          if (loja.ativo !== false) {
                            handleStoreSelect(loja._id)
                          }
                        }}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center",
                            loja.ativo === false && "opacity-50",
                          )}
                        >
                          {loja.logo ? (
                            <Image
                              src={loja.logo || "/placeholder.svg"}
                              alt={loja.nome}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <Store className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">{loja.nome}</span>
                          {loja.ativo === false && <span className="text-xs text-muted-foreground">Loja inativa</span>}
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {selectedStores.length > 0 && (
            <div className="border-t p-2">
              <div className="flex flex-wrap gap-1">
                {selectedStores.length > 0 &&
                  lojas.length > 0 &&
                  selectedStores.map((id) => {
                    const loja = lojas.find((l) => l._id === id)
                    if (!loja) return null
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {loja.nome}
                        <button
                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onClick={(e) => {
                            e.preventDefault()
                            onStoreToggle(id, false)
                          }}
                        >
                          <span className="sr-only">Remover {loja.nome}</span>
                          <span className="text-xs">×</span>
                        </button>
                      </Badge>
                    )
                  })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
