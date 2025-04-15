"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, FileText, Filter, Calendar, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Venda {
  _id: string
  clienteId: string
  cliente: {
    _id: string
    nome: string
    email: string
    telefone: string
  }
  itens: Array<{
    produtoId: string
    quantidade: number
    precoUnitario: number
    subtotal: number
    produto: {
      _id: string
      nome: string
      preco: number
      imagem?: string
    }
  }>
  total: number
  desconto: number
  formaPagamento: string
  status: string
  observacao: string
  dataCriacao: string
  dataAtualizacao: string
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function VendasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [vendas, setVendas] = useState<Venda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState<string>("")
  const router = useRouter()

  // Filtros de data
  const [dataInicio, setDataInicio] = useState<string>("")
  const [dataFim, setDataFim] = useState<string>("")

  useEffect(() => {
    fetchVendas()
  }, [pagination.page, statusFilter, dataInicio, dataFim])

  const fetchVendas = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Construir URL com parâmetros de consulta
      let url = `/api/dashboard/vendas?page=${pagination.page}&limit=${pagination.limit}`

      if (statusFilter) {
        url += `&status=${statusFilter}`
      }

      if (dataInicio) {
        url += `&dataInicio=${dataInicio}`
      }

      if (dataFim) {
        url += `&dataFim=${dataFim}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Erro ao buscar vendas: ${response.status}`)
      }

      const data = await response.json()
      setVendas(data.vendas || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error("Erro ao buscar vendas:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar vendas")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset para a primeira página
  }

  const handleDateFilterChange = (startDate: string, endDate: string) => {
    setDataInicio(startDate)
    setDataFim(endDate)
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset para a primeira página
  }

  const filteredVendas = vendas.filter(
    (venda) =>
      venda.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda._id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Formatar valor em reais
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Formatar data
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString)
      return format(data, "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return "Data inválida"
    }
  }

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "concluida":
      case "concluída":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  // Exportar vendas para CSV
  const exportToCSV = () => {
    // Implementação básica de exportação para CSV
    const headers = ["ID", "Cliente", "Data", "Total", "Status"]

    const csvContent = [
      headers.join(","),
      ...filteredVendas.map((venda) =>
        [
          venda._id,
          venda.cliente?.nome || "Cliente não encontrado",
          formatarData(venda.dataCriacao),
          venda.total,
          venda.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `vendas_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Button className="flex items-center gap-2" onClick={() => router.push("/dashboard/vendas/nova")}>
          <Plus className="h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vendas..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={exportToCSV} title="Exportar para CSV">
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const today = new Date()
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(today.getDate() - 30)

                  handleDateFilterChange(thirtyDaysAgo.toISOString().split("T")[0], today.toISOString().split("T")[0])
                }}
                title="Filtrar últimos 30 dias"
              >
                <Calendar className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateFilterChange("", "")}
                title="Limpar filtros de data"
                disabled={!dataInicio && !dataFim}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>
          ) : filteredVendas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>Nenhuma venda encontrada</p>
              <Button variant="link" className="mt-2" onClick={() => router.push("/dashboard/vendas/nova")}>
                Registrar uma venda
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium">Data</th>
                      <th className="text-left py-3 px-4 font-medium">Total</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendas.map((venda) => (
                      <tr key={venda._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{venda.cliente?.nome || "Cliente não encontrado"}</p>
                            <p className="text-xs text-muted-foreground">{venda._id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatarData(venda.dataCriacao)}</td>
                        <td className="py-3 px-4 font-medium">{formatarValor(venda.total)}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(venda.status)}>
                            {venda.status.charAt(0).toUpperCase() + venda.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => router.push(`/dashboard/vendas/${venda._id}`)}
                              >
                                <Eye className="h-4 w-4" />
                                <span>Ver detalhes</span>
                              </DropdownMenuItem>
                              {venda.status !== "cancelada" && (
                                <>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => router.push(`/dashboard/vendas/${venda._id}/editar`)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span>Editar</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer text-destructive"
                                    onClick={async () => {
                                      if (confirm("Tem certeza que deseja cancelar esta venda?")) {
                                        try {
                                          const response = await fetch(`/api/dashboard/vendas/${venda._id}`, {
                                            method: "DELETE",
                                          })

                                          if (response.ok) {
                                            fetchVendas()
                                          } else {
                                            alert("Erro ao cancelar venda")
                                          }
                                        } catch (error) {
                                          console.error("Erro ao cancelar venda:", error)
                                          alert("Erro ao cancelar venda")
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Cancelar</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                        className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Mostrar primeira página, última página e páginas próximas à atual
                        return page === 1 || page === pagination.totalPages || Math.abs(page - pagination.page) <= 1
                      })
                      .map((page, index, array) => {
                        // Adicionar elipses quando há saltos
                        if (index > 0 && page - array[index - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <PaginationItem>
                                <span className="px-2">...</span>
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationLink
                                  isActive={page === pagination.page}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          )
                        }

                        return (
                          <PaginationItem key={page}>
                            <PaginationLink isActive={page === pagination.page} onClick={() => handlePageChange(page)}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                        className={
                          pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
