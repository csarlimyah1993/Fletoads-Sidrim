"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ClienteForm } from "@/components/clientes/cliente-form"

// Importando a interface Cliente do componente ClienteForm
import type { Cliente } from "@/components/clientes/cliente-form"

// Usando a tipagem correta para Next.js 15
export default function ClienteEditarPage({ params }: { params: Promise<{ id: string }> }) {
  // Resolver a Promise params usando React.use()
  const resolvedParams = React.use(params)
  const id = resolvedParams.id

  const [cliente, setCliente] = useState<Cliente | null>(null)
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

        // Garantir que os dados do cliente estejam no formato esperado
        // Converter null para undefined quando necessário
        const clienteFormatado: Cliente = {
          ...data.cliente,
          email: data.cliente.email || undefined,
          telefone: data.cliente.telefone || undefined,
          documento: data.cliente.documento || undefined,
        }

        setCliente(clienteFormatado)
      } catch (err) {
        console.error(err)
        setError("Erro ao carregar cliente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCliente()
  }, [id])

  if (isLoading)
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )

  if (error || !cliente)
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <Card>
          <div className="flex flex-col items-center justify-center h-64 p-6">
            <p className="text-lg font-medium text-center">{error || "Cliente não encontrado"}</p>
            <Button onClick={() => router.push("/dashboard/clientes")} className="mt-4">
              Voltar para a lista de clientes
            </Button>
          </div>
        </Card>
      </div>
    )

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/clientes/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>{cliente.status || "Sem status"}</Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0">
          <ClienteForm cliente={cliente} />
        </div>
      </Card>
    </div>
  )
}
