"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface Venda {
  id: string
  cliente: string
  valor: number
  data: string
  status: "concluida" | "pendente" | "cancelada"
}

export function VendasRecentes() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulação de carregamento de dados
    const timer = setTimeout(() => {
      // Dados simulados
      setVendas([
        {
          id: "1",
          cliente: "João Silva",
          valor: 299.99,
          data: "2025-04-10",
          status: "concluida",
        },
        {
          id: "2",
          cliente: "Maria Oliveira",
          valor: 1250.5,
          data: "2025-04-09",
          status: "concluida",
        },
        {
          id: "3",
          cliente: "Carlos Santos",
          valor: 499.99,
          data: "2025-04-08",
          status: "pendente",
        },
        {
          id: "4",
          cliente: "Ana Pereira",
          valor: 89.9,
          data: "2025-04-07",
          status: "cancelada",
        },
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
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

  return (
    <div className="space-y-4">
      {vendas.map((venda) => (
        <div key={venda.id} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <p className="font-medium">{venda.cliente}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{new Date(venda.data).toLocaleDateString("pt-BR")}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getStatusIcon(venda.status)}
                {getStatusText(venda.status)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">R$ {venda.valor.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
