"use client"

import { useEffect, useState } from "react"
import { MapPin, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Cliente {
  id: string
  nome: string
  distancia: number
  cidade: string
}

export function ClientesProximosCard() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulação de carregamento de dados
    const timer = setTimeout(() => {
      // Dados simulados
      setClientes([
        { id: "1", nome: "João Silva", distancia: 1.2, cidade: "São José dos Pinhais" },
        { id: "2", nome: "Maria Oliveira", distancia: 2.5, cidade: "São José dos Pinhais" },
        { id: "3", nome: "Carlos Santos", distancia: 3.8, cidade: "Curitiba" },
        { id: "4", nome: "Ana Pereira", distancia: 5.1, cidade: "Curitiba" },
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {clientes.map((cliente) => (
        <div key={cliente.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{cliente.nome}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3" />
              <span>
                {cliente.distancia} km • {cliente.cidade}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
