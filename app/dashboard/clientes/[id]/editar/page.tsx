"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Calendar, CreditCard, Tag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  categoriasPreferidasArray?: string[]
  observacoes?: string
}

export default function ClienteDetalhesPage({ params }: { params: { id: string } }) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchCliente() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/clientes/${params.id}`)

        if (!response.ok) {
          throw new Error(`Erro ao buscar cliente: ${response.status}`)
        }

        const data = await response.json()
        setCliente(data.cliente)
      } catch (err) {
        console.error("Erro ao buscar cliente:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar cliente")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCliente()
  }, [params.id])

  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const formatarData = (dataString: string) => {
    if (!dataString) return "—"
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  const handleDeleteCliente = async () => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const response = await fetch(`/api/clientes/${params.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erro ao excluir cliente")
        }

        router.push("/dashboard/clientes")
      } catch (error) {
        console.error("Erro ao excluir cliente:", error)
        alert("Erro ao excluir cliente")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Cliente</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Cliente</h2>
        </div>
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
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/clientes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{cliente.nome}</h2>
          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
            {cliente.status === "ativo" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/clientes/${params.id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDeleteCliente}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="informacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="informacoes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Nome</p>
                    <p className="text-muted-foreground">{cliente.nome}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{cliente.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-muted-foreground">{cliente.telefone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Documento</p>
                    <p className="text-muted-foreground">{cliente.documento || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cliente.endereco ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Endereço Completo</p>
                      <p className="text-muted-foreground">
                        {cliente.endereco.rua} {cliente.endereco.numero}
                        {cliente.endereco.complemento && `, ${cliente.endereco.complemento}`}
                      </p>
                      <p className="text-muted-foreground">
                        {cliente.endereco.bairro}, {cliente.endereco.cidade} - {cliente.endereco.estado}
                      </p>
                      <p className="text-muted-foreground">CEP: {cliente.endereco.cep}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum endereço cadastrado</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Total Gasto</p>
                    <p className="text-muted-foreground">{formatarValor(cliente.totalGasto)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Número de Pedidos</p>
                    <p className="text-muted-foreground">{cliente.numeroPedidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Data de Cadastro</p>
                    <p className="text-muted-foreground">{formatarData(cliente.dataCriacao)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Última Atualização</p>
                    <p className="text-muted-foreground">{formatarData(cliente.dataAtualizacao)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Nenhum pedido encontrado para este cliente
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Interações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Nenhuma interação registrada
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}