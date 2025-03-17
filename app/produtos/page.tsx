"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Package, Plus, Search, Loader2, AlertCircle, Tag, DollarSign } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function ProdutosPage() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [categoria, setCategoria] = useState("")
  const [ativo, setAtivo] = useState("")
  const [produtos, setProdutos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })

  // Função para criar uma loja padrão se necessário
  const criarLojaPadrao = async () => {
    try {
      const response = await fetch("/api/loja/criar-padrao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        console.log("Loja padrão criada ou já existente")
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao criar loja padrão:", error)
      return false
    }
  }

  // Buscar produtos
  const fetchProdutos = async (page = 1, ativoFilter = ativo, categoriaFilter = categoria) => {
    try {
      setIsLoading(true)
      setError(null)

      // Tentar criar uma loja padrão primeiro
      await criarLojaPadrao()

      let url = `/api/produtos?page=${page}&limit=${pagination.limit}`
      if (ativoFilter) url += `&ativo=${ativoFilter}`
      if (categoriaFilter) url += `&categoria=${categoriaFilter}`
      if (busca) url += `&busca=${encodeURIComponent(busca)}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        // Tratamento de erro mais robusto
        console.error("Erro na API:", data)
        setError(data.error || "Erro ao buscar produtos")
        toast.error(data.error || "Erro ao carregar produtos")
        return
      }

      setProdutos(data.produtos || [])
      setPagination(
        data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1,
        },
      )
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      setError(error instanceof Error ? error.message : "Erro ao buscar produtos")
      toast.error("Erro ao carregar produtos")
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar categorias
  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/produtos/categorias")

      if (response.ok) {
        const data = await response.json()
        setCategorias(data.categorias || [])
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    }
  }

  // Buscar dados ao carregar a página
  useEffect(() => {
    fetchProdutos()
    fetchCategorias()
  }, [])

  // Buscar produtos quando os filtros mudarem
  useEffect(() => {
    fetchProdutos(1, ativo, categoria)
  }, [ativo, categoria])

  // Debounce para a busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busca !== "") {
        fetchProdutos(1, ativo, categoria)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [busca])

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  // Filtrar produtos com base na busca
  const produtosFiltrados = produtos.filter((produto) => {
    const matchBusca = busca
      ? produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        produto.sku.toLowerCase().includes(busca.toLowerCase())
      : true

    return matchBusca
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
        <Button onClick={() => router.push("/dashboard/produtos/novo")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos por nome, descrição ou SKU..."
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
          <Select value={ativo} onValueChange={setAtivo}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
          <TabsTrigger value="destaque">Em Destaque</TabsTrigger>
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
                <Button onClick={() => fetchProdutos()} className="mt-4">
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : produtosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Package className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-center">Nenhum produto encontrado</p>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Comece criando um novo produto ou ajuste seus filtros de busca.
                </p>
                <Button onClick={() => router.push("/dashboard/produtos/novo")} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {produtosFiltrados.map((produto) => (
                <Link href={`/dashboard/produtos/${produto._id}`} key={produto._id}>
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{produto.nome}</CardTitle>
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <CardDescription>{produto.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{produto.categoria}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatarValor(produto.precoPromocional || produto.preco)}
                            </span>
                          </div>
                        </div>
                        {produto.precoPromocional && (
                          <div className="text-xs text-right">
                            <span className="line-through text-muted-foreground">{formatarValor(produto.preco)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <div className="text-xs text-muted-foreground">SKU: {produto.sku}</div>
                      <div className="text-xs text-muted-foreground">Estoque: {produto.estoque} unidades</div>
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
                  onClick={() => fetchProdutos(pagination.page - 1)}
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
                      onClick={() => fetchProdutos(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProdutos(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || isLoading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="ativos" className="space-y-4">
          {/* Conteúdo similar ao da aba "todos", mas filtrado por ativo=true */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {produtosFiltrados
                .filter((p) => p.ativo)
                .map((produto) => (
                  <Link href={`/dashboard/produtos/${produto._id}`} key={produto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{produto.nome}</CardTitle>
                        <CardDescription>{produto.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span>{produto.categoria}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatarValor(produto.precoPromocional || produto.preco)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="text-xs text-muted-foreground">SKU: {produto.sku}</div>
                        <div className="text-xs text-muted-foreground">Estoque: {produto.estoque} unidades</div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="inativos" className="space-y-4">
          {/* Conteúdo similar ao da aba "todos", mas filtrado por ativo=false */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {produtosFiltrados
                .filter((p) => !p.ativo)
                .map((produto) => (
                  <Link href={`/dashboard/produtos/${produto._id}`} key={produto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{produto.nome}</CardTitle>
                        <CardDescription>{produto.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span>{produto.categoria}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatarValor(produto.precoPromocional || produto.preco)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="text-xs text-muted-foreground">SKU: {produto.sku}</div>
                        <div className="text-xs text-muted-foreground">Estoque: {produto.estoque} unidades</div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="destaque" className="space-y-4">
          {/* Conteúdo similar ao da aba "todos", mas filtrado por destaque=true */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {produtosFiltrados
                .filter((p) => p.destaque)
                .map((produto) => (
                  <Link href={`/dashboard/produtos/${produto._id}`} key={produto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{produto.nome}</CardTitle>
                        <CardDescription>{produto.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span>{produto.categoria}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatarValor(produto.precoPromocional || produto.preco)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="text-xs text-muted-foreground">SKU: {produto.sku}</div>
                        <div className="text-xs text-muted-foreground">Estoque: {produto.estoque} unidades</div>
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

