"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Download, Search, Filter, ArrowUpDown, MoreHorizontal, Eye, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"

interface Venda {
  _id: string
  cliente: {
    nome: string
    email?: string
    telefone?: string
  }
  itens: Array<{
    produto: {
      nome: string
      quantidade: number
      preco: number
    }
    quantidade: number
  }>
  valorTotal: number
  status: string
  dataVenda: string
  formaPagamento: string
  observacoes?: string
}

interface EstatisticasVendas {
  totalVendas: number
  vendasHoje: number
  vendasMes: number
  valorTotalVendas: number
  produtosMaisVendidos: Array<{
    nome: string
    quantidade: number
    valor: number
  }>
  vendasPorStatus: Array<{
    status: string
    count: number
  }>
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasVendas>({
    totalVendas: 0,
    vendasHoje: 0,
    vendasMes: 0,
    valorTotalVendas: 0,
    produtosMaisVendidos: [],
    vendasPorStatus: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const router = useRouter()

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch vendas
        const response = await fetch("/api/dashboard/vendas")
        if (!response.ok) {
          throw new Error(`Erro ao buscar vendas: ${response.status}`)
        }
        const data = await response.json()
        console.log("Dados de vendas recebidos:", data)
        setVendas(data.vendas || [])

        // Fetch estatísticas
        const statsResponse = await fetch("/api/vendas/estatisticas")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          console.log("Estatísticas recebidas:", statsData)
          setEstatisticas(statsData)
        }
      } catch (err) {
        console.error("Erro ao buscar vendas:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar vendas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVendas()
  }, [])

  // Filtrar vendas com base nos critérios
  const filteredVendas = vendas.filter((venda) => {
    // Filtro de busca
    const matchesSearch =
      venda.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.itens.some((item) => item.produto.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      venda.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.formaPagamento.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de status
    const matchesStatus = statusFilter === "todos" || venda.status === statusFilter

    // Filtro de data
    let matchesDate = true
    if (dateRange?.from) {
      const vendaDate = new Date(venda.dataVenda)
      matchesDate = vendaDate >= dateRange.from
      if (dateRange.to) {
        matchesDate = matchesDate && vendaDate <= dateRange.to
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Formatar valor em reais
  const formatarValor = (valor: number | undefined | null) => {
    return (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  // Função para exportar vendas (placeholder)
  const exportarVendas = () => {
    toast.info("Funcionalidade de exportação em desenvolvimento")
    console.log("Exportando vendas:", filteredVendas)
  }

  // Função para ver detalhes da venda
  const verDetalhesVenda = (id: string) => {
    router.push(`/dashboard/vendas/${id}`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
        <Button onClick={exportarVendas}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalVendas}</div>
              <p className="text-xs text-muted-foreground">{estatisticas.vendasHoje} vendas hoje</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarValor(estatisticas.valorTotalVendas)}</div>
              <p className="text-xs text-muted-foreground">{estatisticas.vendasMes} vendas este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produto Mais Vendido</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {estatisticas.produtosMaisVendidos[0]?.nome || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.produtosMaisVendidos[0]?.quantidade || 0} unidades vendidas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Mais Comum</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.vendasPorStatus[0]?.status || "N/A"}</div>
              <p className="text-xs text-muted-foreground">{estatisticas.vendasPorStatus[0]?.count || 0} vendas</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vendas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione um período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("todos")
                  setDateRange(undefined)
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="w-full">
              <div className="flex items-center justify-between pb-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-12" />
              </div>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 border-b">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 border-b">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>
          ) : filteredVendas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma venda encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Cliente
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendas.map((venda) => (
                    <TableRow key={venda._id}>
                      <TableCell className="font-medium">{venda._id.substring(0, 8)}</TableCell>
                      <TableCell>{venda.cliente.nome}</TableCell>
                      <TableCell>
                        {venda.itens?.map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.quantidade}x {item.produto?.nome || "N/A"}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>{formatarValor(venda.valorTotal)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            venda.status === "concluido"
                              ? "bg-green-100 text-green-800"
                              : venda.status === "pendente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {venda.status === "concluido"
                            ? "Concluído"
                            : venda.status === "pendente"
                              ? "Pendente"
                              : "Cancelado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatarData(venda.dataVenda)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => verDetalhesVenda(venda._id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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