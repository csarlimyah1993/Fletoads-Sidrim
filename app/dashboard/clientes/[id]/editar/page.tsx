"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Endereco {
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

interface Cliente {
  _id: string
  nome: string
  email: string
  telefone: string
  documento: string
  status: string
  totalGasto: number
  numeroPedidos: number
  dataCadastro: string
  dataCriacao: string
  dataAtualizacao: string
  cidade?: string
  estado?: string
  endereco?: Endereco
  categoriasPreferidasArray?: string[]
  observacoes?: string
}

// Solução 1: Adicione isto no topo do arquivo para desativar a verificação de tipos
// @ts-nocheck

// Solução 2: Ou use esta abordagem tipada corretamente
export default function ClienteEditarPage(props: { params: Promise<{ id: string }> }) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    async function resolveParams() {
      const { id } = await props.params
      setId(id)
    }
    resolveParams()
  }, [props.params])

  useEffect(() => {
    async function fetchCliente() {
      if (!id) return

      try {
        const response = await fetch(`/api/clientes/${id}`)
        if (!response.ok) throw new Error("Erro ao buscar cliente")
        const data = await response.json()
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
      if (!response.ok) throw new Error("Erro ao atualizar cliente")
      router.push(`/dashboard/clientes/${id}`)
    } catch (err) {
      console.error(err)
      alert("Erro ao atualizar cliente.")
    }
  }

  const handleChange = (field: keyof Cliente, value: any) => {
    setCliente((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleEnderecoChange = <K extends keyof Endereco>(field: K, value: Endereco[K]) => {
    setCliente((prev) => {
      if (!prev) return prev
      
      return {
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value
        } as Endereco
      }
    })
  }

  if (isLoading || !id) return <p className="p-6">Carregando...</p>
  if (error || !cliente) return <p className="p-6">{error || "Cliente não encontrado."}</p>

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/clientes/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
            {cliente.status === "ativo" ? "Ativo" : "Inativo"}
          </Badge>
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
              <Input value={cliente.nome} onChange={(e) => handleChange("nome", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={cliente.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={cliente.telefone} onChange={(e) => handleChange("telefone", e.target.value)} />
            </div>
            <div>
              <Label>Documento</Label>
              <Input value={cliente.documento} onChange={(e) => handleChange("documento", e.target.value)} />
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
                <Label>Rua</Label>
                <Input
                  value={cliente.endereco?.rua || ""}
                  onChange={(e) => handleEnderecoChange("rua", e.target.value)}
                />
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  value={cliente.endereco?.numero || ""}
                  onChange={(e) => handleEnderecoChange("numero", e.target.value)}
                />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input
                  value={cliente.endereco?.bairro || ""}
                  onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={cliente.endereco?.cidade || ""}
                  onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input
                  value={cliente.endereco?.estado || ""}
                  onChange={(e) => handleEnderecoChange("estado", e.target.value)}
                />
              </div>
              <div>
                <Label>CEP</Label>
                <Input
                  value={cliente.endereco?.cep || ""}
                  onChange={(e) => handleEnderecoChange("cep", e.target.value)}
                />
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