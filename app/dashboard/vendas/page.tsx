"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import {
  ShoppingBag,
  Plus,
  Search,
  Calendar,
  CreditCard,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export default function VendasPage() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState("")
  const [vendas, setVendas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })

  // Função para buscar vendas
  const fetchVendas = async (page = 1, statusFilter = status) => {
    try {
      setIsLoading(true)
      setError(null)

      let url = `/api/vendas?page=${page}&limit=${pagination.limit}`
      if (statusFilter) url += `&status=${statusFilter}`

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao buscar vendas")
      }

      const data = await response.json()
      setVendas(data.vendas)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Erro ao buscar vendas:", error)
      setError(error instanceof Error ? error.message : "Erro ao buscar vendas")
      toast.error("Erro ao carregar vendas")
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar vendas ao carregar a página
  useEffect(() => {
    fetchVendas()
  }, [])

  // Buscar vendas quando o filtro de status mudar
  useEffect(() => {
    fetchVendas(1, status)
  }, [status])

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  // Função para obter o ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Calendar className="h-4 w-4" />
      case "pago":
        return <DollarSign className="h-4 w-4" />
      case "enviado":
        return <Truck className="h-4 w-4" />
      case "entregue":
        return <CheckCircle className="h-4 w-4" />
      case "cancelado":
        return <XCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  // Função para obter a cor do badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-500"
      case "pago":
        return "bg-blue-500"
      case "enviado":
        return "bg-purple-500"
      case "entregue":
        return "bg-green-500"
      case "cancelado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Função para obter o ícone do método de pagamento
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cartao_credito":
      case "cartao_debito":
        return <CreditCard className="h-4 w-4" />
      case "dinheiro":
      case "pix":
      case "transferencia":
      case "boleto":
        return <DollarSign className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  // Função para formatar o método de pagamento
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "cartao_credito":
        return "Cartão de Crédito"
      case "cartao_debito":
        return "Cartão de Débito"
      case "dinheiro":
        return "Dinheiro"
      case "pix":
        return "PIX"
      case "transferencia":
        return "Transferência"
      case "boleto":
        return "Boleto"
      default:
        return method
    }
  }

  // Filtrar vendas com base na busca
  const vendasFiltradas = vendas.filter((venda) => {
    const matchBusca = busca
      ? venda.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        (venda.cliente?.nome && venda.cliente.nome.toLowerCase().includes(busca.toLowerCase()))
      : true

    return matchBusca
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
        <Button onClick={() => router.push("/dashboard/vendas/nova")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendas por código ou cliente..."
              className="pl-8"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="pagas">Pagas</TabsTrigger>
          <TabsTrigger value="enviadas">Enviadas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <XCircle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-lg font-medium text-center">{error}</p>
                <Button onClick={() => fetchVendas()} className="mt-4">
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : vendasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <ShoppingBag className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-center">Nenhuma venda encontrada</p>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Comece criando uma nova venda ou ajuste seus filtros de busca.
                </p>
                <Button onClick={() => router.push("/dashboard/vendas/nova")} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Venda
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vendasFiltradas.map((venda) => (
                <Link href={`/dashboard/vendas/${venda._id}`} key={venda._id}>
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{venda.codigo}</CardTitle>
                        <Badge className={getStatusColor(venda.status)}>
                          {venda.status.charAt(0).toUpperCase() + venda.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {venda.cliente ? venda.cliente.nome : "Cliente não especificado"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            {getStatusIcon(venda.status)}
                            <span className="ml-2">
                              {format(new Date(venda.dataVenda), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            {getPaymentIcon(venda.metodoPagamento)}
                            <span className="ml-2">{formatPaymentMethod(venda.metodoPagamento)}</span>
                          </div>
                          <span className="font-medium">{formatarValor(venda.valorTotal)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-muted-foreground">
                          {venda.produtos.length} {venda.produtos.length === 1 ? "item" : "itens"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Atualizado em {format(new Date(venda.dataAtualizacao), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchVendas(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                >
                  Anterior
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={pagination.page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchVendas(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchVendas(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || isLoading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-4">
          {/* Conteúdo similar ao da aba "todas", mas filtrado por status="pendente" */}
          {/* Você pode reutilizar a lógica acima, apenas filtrando os resultados */}
        </TabsContent>

        <TabsContent value="pagas" className="space-y-4">
          {/* Conteúdo similar ao da aba "todas", mas filtrado por status="pago" */}
        </TabsContent>

        <TabsContent value="enviadas" className="space-y-4">
          {/* Conteúdo similar ao da aba "todas", mas filtrado por status="enviado" */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

