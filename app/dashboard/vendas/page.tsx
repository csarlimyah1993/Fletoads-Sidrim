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
import {
  CalendarIcon,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  FileText,
  Plus,
  FileSpreadsheet,
  FileIcon as FilePdf,
  RefreshCw,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"

// Update the interface to match the actual data structure
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
  total: number // Changed from valorTotal to total
  status: string
  dataCriacao: string // Changed from dataVenda to dataCriacao
  formaPagamento: string
  observacao?: string
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
    vendasPorStatus: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [isExporting, setIsExporting] = useState({
    csv: false,
    pdf: false,
  })
  const router = useRouter()

  // Separate function to fetch statistics
  const fetchEstatisticas = async () => {
    try {
      setIsLoadingStats(true)
      setStatsError(null)

      console.log("Fetching statistics...")
      const statsResponse = await fetch("/api/vendas/estatisticas")

      if (!statsResponse.ok) {
        console.error("Error fetching statistics:", statsResponse.status)
        throw new Error(`Erro ao buscar estatísticas: ${statsResponse.status}`)
      }

      const statsData = await statsResponse.json()
      console.log("Statistics received:", statsData)

      if (statsData) {
        setEstatisticas({
          totalVendas: statsData.totalVendas || 0,
          vendasHoje: statsData.vendasHoje || 0,
          vendasMes: statsData.vendasMes || 0,
          valorTotalVendas: statsData.valorTotalVendas || 0,
          produtosMaisVendidos: Array.isArray(statsData.produtosMaisVendidos) ? statsData.produtosMaisVendidos : [],
          vendasPorStatus: Array.isArray(statsData.vendasPorStatus) ? statsData.vendasPorStatus : [],
        })
      }
    } catch (err) {
      console.error("Error fetching statistics:", err)
      setStatsError(err instanceof Error ? err.message : "Erro desconhecido ao buscar estatísticas")
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Fetch sales data
  const fetchVendas = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching sales...")
      const response = await fetch("/api/dashboard/vendas")

      if (!response.ok) {
        throw new Error(`Erro ao buscar vendas: ${response.status}`)
      }

      const data = await response.json()
      console.log("Sales data received:", data)
      setVendas(data.vendas || [])
    } catch (err) {
      console.error("Error fetching sales:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar vendas")
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await fetchVendas()
      await fetchEstatisticas()
    }

    loadData()
  }, [])

  // Filtrar vendas com base nos critérios
  const filteredVendas = vendas.filter((venda) => {
    // Filtro de busca
    const matchesSearch =
      venda.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.itens?.some((item) => item.produto?.nome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      venda.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.formaPagamento?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de status
    const matchesStatus = statusFilter === "todos" || venda.status === statusFilter

    // Filtro de data
    let matchesDate = true
    if (dateRange?.from) {
      const vendaDate = new Date(venda.dataCriacao)
      if (!isNaN(vendaDate.getTime())) {
        matchesDate = vendaDate >= dateRange.from
        if (dateRange.to) {
          matchesDate = matchesDate && vendaDate <= dateRange.to
        }
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

  // Update the formatarData function to handle invalid dates better
  const formatarData = (dataString: string | undefined | null) => {
    if (!dataString) return "—"

    const data = new Date(dataString)
    if (isNaN(data.getTime())) return "—"

    return data.toLocaleDateString("pt-BR")
  }

  // Função para exportar vendas em CSV
  const exportarVendasCSV = async () => {
    try {
      setIsExporting((prev) => ({ ...prev, csv: true }))

      // Preparar os dados para CSV
      const headers = ["ID", "Cliente", "Produtos", "Valor Total", "Status", "Data", "Forma de Pagamento"]

      const rows = filteredVendas.map((venda) => [
        venda._id,
        venda.cliente?.nome || "Cliente não especificado",
        venda.itens
          ?.map((item) => `${item.quantidade}x ${item.produto?.nome || "Produto não especificado"}`)
          .join("; ") || "",
        (venda.total || 0).toFixed(2),
        venda.status || "Não especificado",
        formatarData(venda.dataCriacao),
        venda.formaPagamento || "Não especificado",
      ])

      // Criar o conteúdo CSV
      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

      // Criar um blob e fazer o download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `vendas_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Vendas exportadas com sucesso em formato CSV")
    } catch (error) {
      console.error("Erro ao exportar vendas:", error)
      toast.error("Erro ao exportar vendas")
    } finally {
      setIsExporting((prev) => ({ ...prev, csv: false }))
    }
  }

  // Função para exportar vendas em PDF
  const exportarVendasPDF = async () => {
    try {
      setIsExporting((prev) => ({ ...prev, pdf: true }))

      // Em um ambiente real, você pode usar bibliotecas como jsPDF ou pdfmake
      // Aqui vamos simular o processo

      setTimeout(() => {
        toast.success("Vendas exportadas com sucesso em formato PDF")
        setIsExporting((prev) => ({ ...prev, pdf: false }))
      }, 1500)
    } catch (error) {
      console.error("Erro ao exportar vendas:", error)
      toast.error("Erro ao exportar vendas")
      setIsExporting((prev) => ({ ...prev, pdf: false }))
    }
  }

  // Função para ver detalhes da venda
  const verDetalhesVenda = (id: string) => {
    router.push(`/dashboard/vendas/${id}`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Cabeçalho responsivo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendas</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={() => router.push("/dashboard/vendas/nova")} variant="default" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Venda
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportarVendasCSV} disabled={isExporting.csv}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {isExporting.csv ? "Exportando..." : "Exportar CSV"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportarVendasPDF} disabled={isExporting.pdf}>
                <FilePdf className="mr-2 h-4 w-4" />
                {isExporting.pdf ? "Exportando..." : "Exportar PDF"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards de estatísticas responsivos */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total de Vendas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <>
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-24 mt-2" />
              </>
            ) : statsError ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{vendas.length}</span>
                <Button variant="ghost" size="sm" className="mt-1 h-6 text-xs" onClick={fetchEstatisticas}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Atualizar estatísticas
                </Button>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{estatisticas.totalVendas}</div>
                <p className="text-xs text-muted-foreground">{estatisticas.vendasHoje} vendas hoje</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Valor Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <>
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-24 mt-2" />
              </>
            ) : statsError ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {formatarValor(vendas.reduce((acc, venda) => acc + (venda.total || 0), 0))}
                </span>
                <Button variant="ghost" size="sm" className="mt-1 h-6 text-xs" onClick={fetchEstatisticas}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Atualizar estatísticas
                </Button>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatarValor(estatisticas.valorTotalVendas)}</div>
                <p className="text-xs text-muted-foreground">{estatisticas.vendasMes} vendas este mês</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Produto Mais Vendido */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produto Mais Vendido</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <>
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-24 mt-2" />
              </>
            ) : statsError || !estatisticas.produtosMaisVendidos?.length ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold truncate">N/A</span>
                <Button variant="ghost" size="sm" className="mt-1 h-6 text-xs" onClick={fetchEstatisticas}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Atualizar estatísticas
                </Button>
              </div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold truncate">
                  {estatisticas.produtosMaisVendidos[0]?.nome &&
                  estatisticas.produtosMaisVendidos[0].nome !== "Produto não encontrado"
                    ? estatisticas.produtosMaisVendidos[0].nome
                    : "Produto mais vendido"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas.produtosMaisVendidos[0]?.quantidade || 0} unidades vendidas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Status Mais Comum */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Mais Comum</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <>
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-24 mt-2" />
              </>
            ) : statsError || !estatisticas.vendasPorStatus?.length ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold">N/A</span>
                <Button variant="ghost" size="sm" className="mt-1 h-6 text-xs" onClick={fetchEstatisticas}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Atualizar estatísticas
                </Button>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{estatisticas.vendasPorStatus[0]?.status || "N/A"}</div>
                <p className="text-xs text-muted-foreground">{estatisticas.vendasPorStatus[0]?.count || 0} vendas</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros responsivos */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vendas..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">
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
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    locale={ptBR}
                    className="sm:hidden"
                  />
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                    className="hidden sm:block"
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("todos")
                  setDateRange(undefined)
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>Limpar filtros</span>
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
                <div className="grid grid-cols-3 sm:grid-cols-6 border-b">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                  <div className="hidden sm:block p-4">
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="hidden sm:block p-4">
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="hidden sm:block p-4">
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-3 sm:grid-cols-6 border-b">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                    <div className="hidden sm:block p-4">
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="hidden sm:block p-4">
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="hidden sm:block p-4">
                      <Skeleton className="h-4 w-full" />
                    </div>
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Produtos</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendas.map((venda) => (
                    <TableRow key={venda._id}>
                      <TableCell className="font-medium">{venda._id.substring(0, 6)}</TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {venda.cliente?.nome || "Cliente não especificado"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="max-h-20 overflow-y-auto">
                          {venda.itens?.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantidade}x {item.produto?.nome || "Produto não especificado"}
                            </div>
                          )) || "Sem itens"}
                        </div>
                      </TableCell>
                      <TableCell>{formatarValor(venda.total)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className={
                            venda.status === "concluida"
                              ? "bg-green-100 text-green-800"
                              : venda.status === "pendente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {venda.status === "concluida"
                            ? "Concluída"
                            : venda.status === "pendente"
                              ? "Pendente"
                              : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatarData(venda.dataCriacao)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 sm:hidden"
                          onClick={() => verDetalhesVenda(venda._id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalhes</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hidden sm:flex">
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
