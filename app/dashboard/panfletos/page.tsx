"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { FileText, Plus, Search, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import type { IPanfleto } from "@/lib/models/panfleto"

// Define the Panfleto type to match the IPanfleto interface
interface Panfleto extends Omit<IPanfleto, "_id" | "lojaId"> {
  _id: string
  lojaId?: string
}

export default function PanfletosPage() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [categoria, setCategoria] = useState("")
  const [status, setStatus] = useState("")
  const [panfletos, setPanfletos] = useState<Panfleto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar inicialmente
    checkMobile()

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", checkMobile)

    // Limpar listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Buscar panfletos
  const fetchPanfletos = async (page = 1, statusFilter = status, categoriaFilter = categoria) => {
    try {
      setIsLoading(true)
      setError(null)

      let url = `/api/panfletos?page=${page}&limit=${pagination.limit}`
      if (statusFilter) url += `&status=${statusFilter}`
      if (categoriaFilter) url += `&categoria=${categoriaFilter}`

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao buscar panfletos")
      }

      const data = await response.json()
      setPanfletos(data.panfletos || [])
      setPagination(
        data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1,
        },
      )
    } catch (error) {
      console.error("Erro ao buscar panfletos:", error)
      setError(error instanceof Error ? error.message : "Erro ao buscar panfletos")
      toast.error("Erro ao carregar panfletos")
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar categorias
  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/panfletos/categorias")

      if (response.ok) {
        const data = await response.json()
        setCategorias(data.categorias || [])
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
      setCategorias([])
    }
  }

  // Buscar dados ao carregar a página
  useEffect(() => {
    fetchPanfletos()
    fetchCategorias()
  }, [])

  // Buscar panfletos quando os filtros mudarem
  useEffect(() => {
    fetchPanfletos(1, status, categoria)
  }, [status, categoria])

  // Filtrar panfletos com base na busca
  const panfletosFiltrados = panfletos.filter((panfleto) => {
    const matchBusca = busca
      ? panfleto.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        panfleto.descricao.toLowerCase().includes(busca.toLowerCase())
      : true

    return matchBusca
  })

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Panfletos</h2>
        <Button
          onClick={() => router.push("/dashboard/panfletos/novo")}
          className="text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Novo Panfleto
        </Button>
      </div>

      <div className="flex flex-col space-y-3 sm:space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar panfletos..."
              className="pl-8 text-xs sm:text-sm h-9 sm:h-10"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:w-[400px]">
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="publicado">Publicado</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="arquivado">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <div className="relative w-full overflow-auto pb-2">
          <TabsList className="inline-flex min-w-full w-max border-b-0">
            <TabsTrigger value="todos" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Todos
            </TabsTrigger>
            <TabsTrigger value="publicados" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Publicados
            </TabsTrigger>
            <TabsTrigger value="rascunhos" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Rascunhos
            </TabsTrigger>
            <TabsTrigger value="arquivados" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Arquivados
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="todos" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-48 sm:h-64 p-4 sm:p-6">
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-center">{error}</p>
                <Button onClick={() => fetchPanfletos()} className="mt-3 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10">
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : panfletosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-48 sm:h-64 p-4 sm:p-6">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-center">Nenhum panfleto encontrado</p>
                <p className="text-xs sm:text-sm text-gray-500 text-center mt-1">
                  Comece criando um novo panfleto ou ajuste seus filtros de busca.
                </p>
                <Button
                  onClick={() => router.push("/dashboard/panfletos/novo")}
                  className="mt-3 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10"
                >
                  <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Novo Panfleto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {panfletosFiltrados.map((panfleto) => (
                <Link href={`/dashboard/panfletos/${panfleto._id}`} key={panfleto._id}>
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors h-full">
                    <CardHeader className="pb-2 px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base sm:text-lg line-clamp-1">{panfleto.titulo}</CardTitle>
                        <div
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs whitespace-nowrap ${
                            panfleto.status === "publicado"
                              ? "bg-green-100 text-green-800"
                              : panfleto.status === "rascunho"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {panfleto.status === "publicado"
                            ? "Publicado"
                            : panfleto.status === "rascunho"
                              ? "Rascunho"
                              : "Arquivado"}
                        </div>
                      </div>
                      <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
                        {panfleto.descricao}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 py-2">
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <FileText className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{panfleto.categoria}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0 px-3 sm:px-6 pb-3 sm:pb-4">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        Publicado em:{" "}
                        {panfleto.dataCriacao
                          ? format(new Date(panfleto.dataCriacao), "dd/MM/yyyy")
                          : "Data não disponível"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {panfleto.visualizacoes} visualizações
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-4 sm:mt-6">
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPanfletos(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                  className="text-xs h-8 px-2 sm:px-3"
                >
                  Anterior
                </Button>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Em dispositivos móveis, mostrar apenas páginas próximas à atual
                      if (isMobile) {
                        return page === 1 || page === pagination.pages || Math.abs(page - pagination.page) <= 1
                      }
                      return true
                    })
                    .map((page, index, array) => {
                      // Adicionar elipses para páginas omitidas
                      if (isMobile && index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <span key={`ellipsis-${page}`} className="text-xs text-muted-foreground px-1">
                            ...
                          </span>
                        )
                      }

                      return (
                        <Button
                          key={page}
                          variant={pagination.page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => fetchPanfletos(page)}
                          disabled={isLoading}
                          className="text-xs h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPanfletos(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || isLoading}
                  className="text-xs h-8 px-2 sm:px-3"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="publicados" className="space-y-4">
          {/* Conteúdo similar ao da aba "todos", mas filtrado por status="publicado" */}
          {isLoading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {panfletosFiltrados
                .filter((p) => p.status === "publicado")
                .map((panfleto) => (
                  <Link href={`/dashboard/panfletos/${panfleto._id}`} key={panfleto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors h-full">
                      <CardHeader className="pb-2 px-3 sm:px-6 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg line-clamp-1">{panfleto.titulo}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
                          {panfleto.descricao}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6 py-2">
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <FileText className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">{panfleto.categoria}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0 px-3 sm:px-6 pb-3 sm:pb-4">
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          Publicado em:{" "}
                          {panfleto.dataCriacao
                            ? format(new Date(panfleto.dataCriacao), "dd/MM/yyyy")
                            : "Data não disponível"}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          {panfleto.visualizacoes} visualizações
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rascunhos" className="space-y-4">
          {/* Conteúdo similar ao da aba "todos", mas filtrado por status="rascunho" */}
          {isLoading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {panfletosFiltrados
                .filter((p) => p.status === "rascunho")
                .map((panfleto) => (
                  <Link href={`/dashboard/panfletos/${panfleto._id}`} key={panfleto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors h-full">
                      <CardHeader className="pb-2 px-3 sm:px-6 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg line-clamp-1">{panfleto.titulo}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
                          {panfleto.descricao}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6 py-2">
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <FileText className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">{panfleto.categoria}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0 px-3 sm:px-6 pb-3 sm:pb-4">
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          Criado em:{" "}
                          {panfleto.dataCriacao
                            ? format(new Date(panfleto.dataCriacao), "dd/MM/yyyy")
                            : "Data não disponível"}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="arquivados" className="space-y-4">
          {/* Conteúdo similar ao da aba "todos", mas filtrado por status="arquivado" */}
          {isLoading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {panfletosFiltrados
                .filter((p) => p.status === "arquivado")
                .map((panfleto) => (
                  <Link href={`/dashboard/panfletos/${panfleto._id}`} key={panfleto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors h-full">
                      <CardHeader className="pb-2 px-3 sm:px-6 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg line-clamp-1">{panfleto.titulo}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
                          {panfleto.descricao}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6 py-2">
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <FileText className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">{panfleto.categoria}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0 px-3 sm:px-6 pb-3 sm:pb-4">
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          Arquivado em:{" "}
                          {panfleto.dataCriacao
                            ? format(new Date(panfleto.dataCriacao), "dd/MM/yyyy")
                            : "Data não disponível"}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          {panfleto.visualizacoes} visualizações
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
