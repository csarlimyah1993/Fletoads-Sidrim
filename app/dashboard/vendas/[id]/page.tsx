"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  Building2,
  Edit,
  Trash2,
  Printer,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function VendaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params usando React.use()
  const unwrappedParams = React.use(params)
  const vendaId = unwrappedParams.id
  const router = useRouter()
  const [venda, setVenda] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)

  // Buscar detalhes da venda
  useEffect(() => {
    const fetchVenda = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/vendas/${vendaId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao buscar detalhes da venda")
        }

        const data = await response.json()
        setVenda(data)
      } catch (error) {
        console.error("Erro ao buscar detalhes da venda:", error)
        setError(error instanceof Error ? error.message : "Erro ao buscar detalhes da venda")
        toast.error("Erro ao carregar detalhes da venda")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVenda()
  }, [vendaId])

  // Função para cancelar a venda
  const cancelarVenda = async () => {
    try {
      setIsCanceling(true)

      const response = await fetch(`/api/vendas/${vendaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao cancelar venda")
      }

      toast.success("Venda cancelada com sucesso")
      router.push("/dashboard/vendas")
    } catch (error) {
      console.error("Erro ao cancelar venda:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao cancelar venda")
    } finally {
      setIsCanceling(false)
    }
  }

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  // Função para formatar data
  const formatarData = (dataString: string | undefined | null) => {
    if (!dataString) return "—"

    const data = new Date(dataString)
    if (isNaN(data.getTime())) return "—"

    return format(data, "dd/MM/yyyy", { locale: ptBR })
  }

  // Função para obter o ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Calendar className="h-5 w-5" />
      case "pago":
      case "concluida":
        return <CheckCircle className="h-5 w-5" />
      case "enviado":
        return <Truck className="h-5 w-5" />
      case "entregue":
        return <CheckCircle className="h-5 w-5" />
      case "cancelada":
        return <XCircle className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  // Função para obter a cor do badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-500"
      case "pago":
      case "concluida":
        return "bg-green-500"
      case "enviado":
        return "bg-purple-500"
      case "entregue":
        return "bg-green-500"
      case "cancelada":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Função para formatar o método de pagamento
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "cartao_credito":
      case "credito":
        return "Cartão de Crédito"
      case "cartao_debito":
      case "debito":
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

  // Função para obter o ícone do método de pagamento
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cartao_credito":
      case "cartao_debito":
      case "credito":
      case "debito":
        return <CreditCard className="h-5 w-5" />
      case "dinheiro":
      case "pix":
      case "transferencia":
      case "boleto":
        return <DollarSign className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">Carregando detalhes da venda...</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !venda) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">Erro ao carregar venda</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <XCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-lg font-medium text-center">{error || "Venda não encontrada"}</p>
            <Button onClick={() => router.push("/dashboard/vendas")} className="mt-4">
              Voltar para Vendas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Adaptar os dados da venda para o formato esperado pelo componente
  const vendaData = {
    codigo: venda._id?.substring(0, 8) || "N/A",
    dataVenda: venda.dataCriacao || new Date().toISOString(),
    status: venda.status || "pendente",
    valorTotal: venda.total || 0,
    metodoPagamento: venda.formaPagamento || "N/A",
    observacoes: venda.observacao || "",
    dataAtualizacao: venda.dataAtualizacao || venda.dataCriacao,
    produtos:
      venda.itens?.map((item: any) => ({
        nome: item.produto?.nome || "Produto não especificado",
        quantidade: item.quantidade || 0,
        precoUnitario: item.produto?.preco || 0,
        subtotal: (item.quantidade || 0) * (item.produto?.preco || 0),
      })) || [],
    cliente: venda.cliente || null,
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{vendaData.codigo}</h2>
            <p className="text-gray-500">Venda realizada em {formatarData(vendaData.dataVenda)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/vendas/editar/${vendaId}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={vendaData.status === "cancelada" || isCanceling}>
                {isCanceling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Cancelar Venda
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Venda</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar esta venda? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={cancelarVenda}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Detalhes da Venda</CardTitle>
                <Badge className={getStatusColor(vendaData.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(vendaData.status)}
                    <span>{vendaData.status.charAt(0).toUpperCase() + vendaData.status.slice(1)}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="produtos">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="produtos">Produtos</TabsTrigger>
                  <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
                </TabsList>
                <TabsContent value="produtos" className="mt-4">
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">Produto</th>
                            <th className="p-2 text-center font-medium">Quantidade</th>
                            <th className="p-2 text-right font-medium">Preço</th>
                            <th className="p-2 text-right font-medium">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendaData.produtos.map((produto: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{produto.nome}</td>
                              <td className="p-2 text-center">{produto.quantidade}</td>
                              <td className="p-2 text-right">{formatarValor(produto.precoUnitario)}</td>
                              <td className="p-2 text-right">{formatarValor(produto.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-muted/50">
                            <td colSpan={3} className="p-2 text-right font-medium">
                              Total
                            </td>
                            <td className="p-2 text-right font-bold">{formatarValor(vendaData.valorTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {vendaData.observacoes && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Observações</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{vendaData.observacoes}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="pagamento" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border rounded-md">
                      {getPaymentIcon(vendaData.metodoPagamento)}
                      <div>
                        <p className="font-medium">Método de Pagamento</p>
                        <p>{formatPaymentMethod(vendaData.metodoPagamento)}</p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <p className="font-medium mb-2">Resumo do Pagamento</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatarValor(vendaData.valorTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frete</span>
                          <span>Grátis</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatarValor(vendaData.valorTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {vendaData.cliente ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Nome</p>
                      <p>{vendaData.cliente.nome}</p>
                    </div>
                  </div>

                  {vendaData.cliente.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p>{vendaData.cliente.email}</p>
                      </div>
                    </div>
                  )}

                  {vendaData.cliente.telefone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Telefone</p>
                        <p>{vendaData.cliente.telefone}</p>
                      </div>
                    </div>
                  )}

                  {vendaData.cliente.empresa && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Empresa</p>
                        <p>{vendaData.cliente.empresa}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Cliente não especificado</p>
              )}
            </CardContent>
            <CardFooter>
              {vendaData.cliente && vendaData.cliente._id && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/clientes/${vendaData.cliente._id}`)}
                >
                  Ver Detalhes do Cliente
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Venda Criada</p>
                    <p className="text-sm text-gray-500">{formatarData(vendaData.dataVenda)}</p>
                  </div>
                </div>

                {vendaData.dataAtualizacao && vendaData.dataAtualizacao !== vendaData.dataVenda && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Edit className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Última Atualização</p>
                      <p className="text-sm text-gray-500">{formatarData(vendaData.dataAtualizacao)}</p>
                    </div>
                  </div>
                )}

                {vendaData.status === "cancelada" && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Venda Cancelada</p>
                      <p className="text-sm text-gray-500">{formatarData(vendaData.dataAtualizacao)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
