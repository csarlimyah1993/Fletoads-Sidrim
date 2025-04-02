"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchBarProps {
  cidades: string[]
  estados: string[]
  onSearch?: (params: { busca?: string; cidade?: string; estado?: string }) => void
  initialBusca?: string
  initialCidade?: string
  initialEstado?: string
}

export function SearchBar({
  cidades,
  estados,
  onSearch,
  initialBusca = "",
  initialCidade = "",
  initialEstado = "",
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [busca, setBusca] = useState(initialBusca || "")
  const [cidade, setCidade] = useState(initialCidade || "")
  const [estado, setEstado] = useState(initialEstado || "")

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ busca, cidade, estado })
      return
    }

    // Construir URL com parâmetros
    const params = new URLSearchParams()

    if (busca) {
      params.set("busca", busca)
    }

    if (cidade && cidade !== "all") {
      params.set("cidade", cidade)
    }

    if (estado && estado !== "all") {
      params.set("estado", estado)
    }

    // Resetar página
    params.set("pagina", "1")

    // Preserve any other parameters that might be in the URL
    const currentParams = new URLSearchParams(searchParams.toString())
    const categoria = currentParams.get("categoria")
    if (categoria) {
      params.set("categoria", categoria)
    }

    router.push(`/vitrines?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar lojas, produtos ou serviços..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Estado
            </label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {estados.map((est) => (
                  <SelectItem key={est} value={est}>
                    {est}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Cidade
            </label>
            <Select value={cidade} onValueChange={setCidade}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cidades.map((cid) => (
                  <SelectItem key={cid} value={cid}>
                    {cid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>
    </div>
  )
}

