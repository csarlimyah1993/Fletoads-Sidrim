"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Calendar, CreditCard, Tag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  endereco?: string
  cep?: string
  categoriasPreferidasArray?: string[]
  observacoes?: string
  interacoes?: string
  feedbacks?: string
  genero?: string
  dataNascimento?: string
  vip?: boolean
  canalEntrada?: string
  preferenciaContato?: string
  frequenciaCompra?: string
  produtosComprados?: any[]
  ultimaCompra?: string
}

export default function ClienteDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCliente() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Buscando cliente com ID:", id)
        const response = await fetch(`/api/clientes/${id}`)

        if (!response.ok) {
          throw new Error(`Erro ao buscar cliente: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dados recebidos:", data)
        setCliente(data.cliente)
      } catch (err) {
        console.error("Erro ao buscar cliente:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar cliente")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCliente()
    }
  }, [id])

  const formatarValor = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const formatarData = (dataString: string) => {
    if (!dataString) return "—"
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  const handleDeleteCliente = async () => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const response = await fetch(`/api/clientes/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Erro ao excluir cliente")

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
          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>{cliente.status || "Sem status"}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/clientes/${id}/editar`)}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Nome:</span> {cliente.nome}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span> {cliente.email || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span> {cliente.telefone || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Documento:</span> {cliente.documento || "—"}
                </div>
                {cliente.genero && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Gênero:</span> {cliente.genero}
                  </div>
                )}
                {cliente.dataNascimento && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Data de Nascimento:</span> {formatarData(cliente.dataNascimento)}
                  </div>
                )}
                {cliente.vip !== undefined && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Cliente VIP:</span> {cliente.vip ? "Sim" : "Não"}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Endereço:</span> {cliente.endereco || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">CEP:</span> {cliente.cep || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cidade:</span> {cliente.cidade || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Estado:</span> {cliente.estado || "—"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Total Gasto:</span> {formatarValor(cliente.totalGasto || 0)}
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Número de Pedidos:</span> {cliente.numeroPedidos || 0}
                </div>
                {cliente.ultimaCompra && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Última Compra:</span> {formatarData(cliente.ultimaCompra)}
                  </div>
                )}
                {cliente.frequenciaCompra && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Frequência de Compra:</span> {cliente.frequenciaCompra}
                  </div>
                )}
                {cliente.categoriasPreferidasArray && cliente.categoriasPreferidasArray.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="font-medium">Categorias Preferidas:</span>
                    <div className="flex flex-wrap gap-1">
                      {cliente.categoriasPreferidasArray.map((categoria, index) => (
                        <Badge key={index} variant="outline">
                          {categoria}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cliente.canalEntrada && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Canal de Entrada:</span> {cliente.canalEntrada}
                  </div>
                )}
                {cliente.preferenciaContato && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Preferência de Contato:</span> {cliente.preferenciaContato}
                  </div>
                )}
                {cliente.interacoes && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Interações:</span>
                      <p className="text-sm text-muted-foreground">{cliente.interacoes}</p>
                    </div>
                  </div>
                )}
                {cliente.feedbacks && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Feedbacks:</span>
                      <p className="text-sm text-muted-foreground">{cliente.feedbacks}</p>
                    </div>
                  </div>
                )}
                {cliente.observacoes && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Observações:</span>
                      <p className="text-sm text-muted-foreground">{cliente.observacoes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Data de Cadastro:</span> {formatarData(cliente.dataCadastro)}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Data de Criação:</span> {formatarData(cliente.dataCriacao)}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Última Atualização:</span> {formatarData(cliente.dataAtualizacao)}
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
