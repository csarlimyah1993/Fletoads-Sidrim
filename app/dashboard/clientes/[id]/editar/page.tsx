"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Cliente {
  _id: string
  nome: string
  email: string | null
  telefone: string | null
  documento: string | null
  status: string
  totalGasto: number
  numeroPedidos: number
  dataCadastro: string
  dataCriacao: string
  dataAtualizacao: string
  cidade?: string
  estado?: string
  cep?: string
  endereco?: string
  categoriasPreferidasArray?: string[]
  observacoes?: string
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !cliente) return

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar cliente")
      }

      router.push(`/dashboard/clientes/${id}`)
    } catch (err) {
      console.error(err)
      alert("Erro ao atualizar cliente.")
    }
  }

  const handleChange = (field: keyof Cliente, value: any) => {
    setCliente((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

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
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-lg font-medium text-center">{error || "Cliente não encontrado"}</p>
            <Button onClick={() => router.push("/dashboard/clientes")} className="mt-4">
              Voltar para a lista de clientes
            </Button>
          </CardContent>
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

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <Label>Nome</Label>
              <Input value={cliente.nome} onChange={(e) => handleChange("nome", e.target.value)} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={cliente.email || ""}
                onChange={(e) => handleChange("email", e.target.value || null)}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={cliente.telefone || ""}
                onChange={(e) => handleChange("telefone", e.target.value || null)}
              />
            </div>
            <div>
              <Label>Documento</Label>
              <Input
                value={cliente.documento || ""}
                onChange={(e) => handleChange("documento", e.target.value || null)}
              />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={cliente.observacoes || ""}
                onChange={(e) => handleChange("observacoes", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Endereço</Label>
                <Input value={cliente.endereco || ""} onChange={(e) => handleChange("endereco", e.target.value)} />
              </div>
              <div>
                <Label>CEP</Label>
                <Input value={cliente.cep || ""} onChange={(e) => handleChange("cep", e.target.value)} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={cliente.cidade || ""} onChange={(e) => handleChange("cidade", e.target.value)} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input value={cliente.estado || ""} onChange={(e) => handleChange("estado", e.target.value)} />
              </div>
            </div>

            <Button type="submit" className="mt-4">
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
