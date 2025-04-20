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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Panfletos</h2>
        <Button onClick={() => router.push("/dashboard/panfletos/novo")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Panfleto
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar panfletos..."
              className="pl-8"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:w-[400px]">
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
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
            <SelectTrigger>
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
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="publicados">Publicados</TabsTrigger>
          <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
          <TabsTrigger value="arquivados">Arquivados</TabsTrigger>
        </TabsList>
        <TabsContent value="todos" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-lg font-medium text-center">{error}</p>
                <Button onClick={() => fetchPanfletos()} className="mt-4">
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : panfletosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <FileText className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-center">Nenhum panfleto encontrado</p>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Comece criando um novo panfleto ou ajuste seus filtros de busca.
                </p>
                <Button onClick={() => router.push("/dashboard/panfletos/novo")} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Panfleto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {panfletosFiltrados.map((panfleto) => (
                <Link href={`/dashboard/panfletos/${panfleto._id}`} key={panfleto._id}>
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{panfleto.titulo}</CardTitle>
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${
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
                      <CardDescription>{panfleto.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="mr-1 h-4 w-4" />
                        <span>{panfleto.categoria}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <div className="text-xs text-muted-foreground">
                        Publicado em:{" "}
                        {panfleto.dataCriacao
                          ? format(new Date(panfleto.dataCriacao), "dd/MM/yyyy")
                          : "Data não disponível"}
                      </div>
                      <div className="text-xs text-muted-foreground">{panfleto.visualizacoes} visualizações</div>
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
                  onClick={() => fetchPanfletos(pagination.page - 1)}
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
                      onClick={() => fetchPanfletos(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPanfletos(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || isLoading}
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
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {panfletosFiltrados
                .filter((p) => p.status === "publicado")
                .map((panfleto) => (
                  <Link href={`/dashboard/panfletos/${panfleto._id}`} key={panfleto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{panfleto.titulo}</CardTitle>
                        <CardDescription>{panfleto.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <FileText className="mr-1 h-4 w-4" />
                          <span>{panfleto.categoria}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="text-xs text-muted-foreground">
                          Publicado em:{" "}
                          {panfleto.dataCriacao
                            ? format(new Date(panfleto.dataCriacao), "dd/MM/yyyy")
                            : "Data não disponível"}
                        </div>
                        <div className="text-xs text-muted-foreground">{panfleto.visualizacoes} visualizações</div>
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
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {panfletosFiltrados
                .filter((p) => p.status === "rascunho")
                .map((panfleto) => (
                  <Link href={`/dashboard/panfletos/${panfleto._id}`} key={panfleto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{panfleto.titulo}</CardTitle>
                        <CardDescription>{panfleto.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <FileText className="mr-1 h-4 w-4" />
                          <span>{panfleto.categoria}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="text-xs text-muted-foreground">
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
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {panfletosFiltrados
                .filter((p) => p.status === "arquivado")
                .map((panfleto) => (
                  <Link href={`/dashboard/panfletos/${panfleto._id}`} key={panfleto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{panfleto.titulo}</CardTitle>
                        <CardDescription>{panfleto.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <FileText className="mr-1 h-4 w-4" />
                          <span>{panfleto.categoria}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="text-xs text-muted-foreground">
                          Arquivado em:{" "}
                          {panfleto.dataCriacao
                            ? format(new Date(panfleto.dataCriacao), "dd/MM/yyyy")
                            : "Data não disponível"}
                        </div>
                        <div className="text-xs text-muted-foreground">{panfleto.visualizacoes} visualizações</div>
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
