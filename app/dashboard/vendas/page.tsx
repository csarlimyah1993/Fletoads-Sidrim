"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Download, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Venda {
  _id: string
  cliente: {
    nome: string
    email?: string
    telefone?: string
  }
  produtos: Array<{
    nome: string
    quantidade: number
    preco: number
  }>
  total: number
  status: string
  dataCriacao: string
  formaPagamento: string
}

export default function VendasPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined)
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined)
  const [totalVendas, setTotalVendas] = useState(0)
  const [totalItens, setTotalItens] = useState(0)
  const [ticketMedio, setTicketMedio] = useState(0)

  useEffect(() => {
    if (session?.user) {
      fetchVendas()
    }
  }, [session, statusFiltro, dataInicio, dataFim])

  const fetchVendas = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = "/api/vendas"
      const params = new URLSearchParams()

      if (statusFiltro && statusFiltro !== "todos") {
        params.append("status", statusFiltro)
      }

      if (dataInicio) {
        params.append("dataInicio", dataInicio.toISOString())
      }

      if (dataFim) {
        params.append("dataFim", dataFim.toISOString())
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          // Não há vendas registradas
          setVendas([])
          setTotalVendas(0)
          setTotalItens(0)
          setTicketMedio(0)
          setLoading(false)
          return
        }
        throw new Error(`Erro ao buscar vendas: ${response.status}`)
      }

      const data = await response.json()
      setVendas(data.vendas || [])

      // Calcular métricas
      if (data.vendas && data.vendas.length > 0) {
        const total = data.vendas.reduce((acc: number, venda: Venda) => acc + venda.total, 0)
        const itens = data.vendas.reduce(
          (acc: number, venda: Venda) =>
            acc + venda.produtos.reduce((prodAcc: number, prod) => prodAcc + prod.quantidade, 0),
          0,
        )
        setTotalVendas(total)
        setTotalItens(itens)
        setTicketMedio(total / data.vendas.length)
      } else {
        setTotalVendas(0)
        setTotalItens(0)
        setTicketMedio(0)
      }
    } catch (err) {
      console.error(err)
      setError((err as Error).message || "Erro ao buscar vendas")
    } finally {
      setLoading(false)
    }
  }

  const handleNovaVenda = () => {
    router.push("/dashboard/vendas/nova")
  }

  const handleExportarVendas = () => {
    // Implementar exportação de vendas
    alert("Funcionalidade de exportação em desenvolvimento")
  }

  const filtrarVendas = () => {
    if (!filtro) return vendas

    const termoBusca = filtro.toLowerCase()
    return vendas.filter(
      (venda) =>
        venda.cliente.nome.toLowerCase().includes(termoBusca) ||
        venda.produtos.some((produto) => produto.nome.toLowerCase().includes(termoBusca)) ||
        venda._id.toLowerCase().includes(termoBusca),
    )
  }

  const vendasFiltradas = filtrarVendas()

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString)
      return format(data, "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch (error) {
      return dataString
    }
  }

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "concluída":
      case "concluida":
      case "pago":
        return "bg-green-100 text-green-800"
      case "pendente":
        return "bg-yellow-100 text-yellow-800"
      case "cancelada":
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Componente para exibir quando não há vendas
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-2">Nenhuma venda registrada</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Você ainda não possui vendas registradas. Comece a registrar suas vendas para acompanhar seu desempenho.
      </p>
      <Button onClick={handleNovaVenda}>
        <Plus className="h-4 w-4 mr-2" />
        Registrar Nova Venda
      </Button>
    </div>
  )

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendas</h1>
          <p className="text-gray-500">Gerencie e acompanhe suas vendas</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleExportarVendas}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleNovaVenda}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatarMoeda(totalVendas)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Itens Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-6 w-24" /> : <div className="text-2xl font-bold">{totalItens}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatarMoeda(ticketMedio)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>Visualize e gerencie todas as suas vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Buscar por cliente, produto ou ID..."
                  className="pl-8"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status" className="sr-only">
                  Status
                </Label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="data-inicio" className="sr-only">
                  Data Início
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="data-inicio"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Data início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} initialFocus locale={ptBR} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="data-fim" className="sr-only">
                  Data Fim
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="data-fim"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !dataFim && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy") : "Data fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dataFim} onSelect={setDataFim} initialFocus locale={ptBR} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchVendas}>
                Tentar novamente
              </Button>
            </div>
          ) : vendasFiltradas.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasFiltradas.map((venda) => (
                    <TableRow key={venda._id}>
                      <TableCell className="font-medium">{venda._id.substring(0, 8)}...</TableCell>
                      <TableCell>{venda.cliente.nome}</TableCell>
                      <TableCell>{formatarData(venda.dataCriacao)}</TableCell>
                      <TableCell>{formatarMoeda(venda.total)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(venda.status)}`}>
                          {venda.status}
                        </span>
                      </TableCell>
                      <TableCell>{venda.formaPagamento}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/vendas/${venda._id}`)}>
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
