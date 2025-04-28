"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ClienteDetails } from "@/components/clientes/cliente-details"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Usando a tipagem correta para Next.js 15
export default function ClienteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Resolver a Promise params usando React.use()
  const resolvedParams = React.use(params)
  const id = resolvedParams.id

  const [cliente, setCliente] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchCliente() {
      if (!id) return

      try {
        console.log("Buscando cliente com ID:", id)
        const response = await fetch(`/api/clientes/${id}`)

        if (!response.ok) {
          throw new Error(`Erro ao buscar cliente: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dados recebidos:", data)
        setCliente(data.cliente)
      } catch (err) {
        console.error(err)
        setError("Erro ao carregar cliente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCliente()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="font-medium mb-2">Erro</h2>
          <p>{error || "Cliente não encontrado"}</p>
          <Button onClick={() => router.push("/dashboard/clientes")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a lista de clientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <ClienteDetails cliente={cliente} />
    </div>
  )
}
