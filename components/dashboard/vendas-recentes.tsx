"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Venda {
  _id: string
  cliente: {
    nome: string
  }
  total: number
  dataCriacao: string
  status: "concluida" | "pendente" | "cancelada"
}

export function VendasRecentes() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchVendas = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/dashboard/vendas?limit=5")

      if (!response.ok) {
        throw new Error(`Erro ao buscar vendas: ${response.status}`)
      }

      const data = await response.json()
      console.log("Vendas recentes:", data.vendas)

      // Ordenar por data de criação (mais recentes primeiro)
      const vendasOrdenadas = data.vendas
        ? [...data.vendas]
            .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
            .slice(0, 5)
        : []

      setVendas(vendasOrdenadas)
    } catch (err) {
      console.error("Erro ao buscar vendas recentes:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar vendas recentes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendas()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluida":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pendente":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "cancelada":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "concluida":
        return "Concluída"
      case "pendente":
        return "Pendente"
      case "cancelada":
        return "Cancelada"
      default:
        return status
    }
  }

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString)
      return data.toLocaleDateString("pt-BR")
    } catch (error) {
      return "Data inválida"
    }
  }

  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchVendas} className="gap-1">
          <RefreshCw className="h-3 w-3" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (vendas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Nenhuma venda recente encontrada</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/vendas/nova")} className="gap-1">
          Registrar venda
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {vendas.map((venda) => (
        <div
          key={venda._id}
          className="flex items-center justify-between border-b pb-3 last:border-0 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded-md transition-colors"
          onClick={() => router.push(`/dashboard/vendas/${venda._id}`)}
        >
          <div>
            <p className="font-medium">{venda.cliente?.nome || "Cliente não especificado"}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{formatarData(venda.dataCriacao)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getStatusIcon(venda.status)}
                {getStatusText(venda.status)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatarValor(venda.total)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
