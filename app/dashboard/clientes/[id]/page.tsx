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
        console.log("Dados do cliente recebidos:", data)
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

  // Formatar valor em reais
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Formatar data
  const formatarData = (dataString: string) => {
    if (!dataString) return "—"
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  // Função para lidar com a exclusão de cliente
  const handleDeleteCliente = async () => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const response = await fetch(`/api/clientes/${params.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erro ao excluir cliente")
        }

        // Redirecionar para a lista de clientes
        router.push("/dashboard/clientes")

        // Mostrar mensagem de sucesso
        alert("Cliente excluído com sucesso")
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
          <Badge
            className={`ml-2 ${
              cliente.status === "ativo"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : cliente.status === "prospecto"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
            }`}
          >
            {cliente.status === "ativo"
              ? "Ativo"
              : cliente.status === "prospecto"
                ? "Prospecto"
                : cliente.status || "Indefinido"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Pessoais</CardTitle>
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
                <CardTitle className="text-lg">Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cliente.endereco ? (
                  <>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Endereço Completo</p>
                        <p className="text-muted-foreground">
                          {[
                            cliente.endereco.rua,
                            cliente.endereco.numero,
                            cliente.endereco.complemento,
                            cliente.endereco.bairro,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p className="text-muted-foreground">
                          {[cliente.endereco.cidade, cliente.endereco.estado, cliente.endereco.cep]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-24 text-muted-foreground">
                    Nenhum endereço cadastrado
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Categorias Preferidas</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cliente.categoriasPreferidasArray && cliente.categoriasPreferidasArray.length > 0 ? (
                        cliente.categoriasPreferidasArray.map((categoria, index) => (
                          <Badge key={index} variant="secondary">
                            {categoria}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Nenhuma categoria preferida</p>
                      )}
                    </div>
                  </div>
                </div>
                {cliente.observacoes && (
                  <div className="mt-4">
                    <p className="font-medium">Observações</p>
                    <p className="text-muted-foreground mt-1">{cliente.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Adicionais</CardTitle>
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
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Total Gasto</p>
                    <p className="text-muted-foreground">{formatarValor(cliente.totalGasto || 0)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Número de Pedidos</p>
                    <p className="text-muted-foreground">{cliente.numeroPedidos || 0}</p>
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
                Nenhuma interação registrada para este cliente
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
