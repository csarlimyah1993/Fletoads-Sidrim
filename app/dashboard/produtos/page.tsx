"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Package, Plus, Search, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { Produto } from "@/types/loja"

export default function ProdutosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoria, setCategoria] = useState("")
  const [ativo, setAtivo] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
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

      let url = `/api/dashboard/produtos?page=${page}&limit=${pagination.limit}`
      if (ativoFilter) url += `&ativo=${ativoFilter}`
      if (categoriaFilter) url += `&categoria=${categoriaFilter}`
      if (searchTerm) url += `&busca=${encodeURIComponent(searchTerm)}`

      console.log("Buscando produtos na URL:", url)
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        // Tratamento de erro mais robusto
        console.error("Erro na API:", data)
        setError(data.error || "Erro ao buscar produtos")
        toast.error(data.error || "Erro ao carregar produtos")
        return
      }

      console.log("Resposta da API:", data)

      // Garantir que produtos seja sempre um array
      const produtosArray = Array.isArray(data.produtos) ? data.produtos : data && Array.isArray(data) ? data : []

      console.log("Produtos encontrados:", produtosArray.length)
      setProdutos(produtosArray)

      // Calcular categorias a partir dos produtos
      if (produtosArray.length > 0) {
        const categoriasMap: Record<string, number> = {}
        produtosArray.forEach((produto: Produto) => {
          if (produto.categoria) {
            categoriasMap[produto.categoria] = (categoriasMap[produto.categoria] || 0) + 1
          }
        })

        // Extrair categorias únicas
        const categoriasUnicas = Object.keys(categoriasMap)
        setCategorias(categoriasUnicas)
      }

      setPagination(
        data.pagination || {
          total: produtosArray.length,
          page: 1,
          limit: 10,
          pages: 1,
        },
      )
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      setError(error instanceof Error ? error.message : "Erro ao buscar produtos")
      toast.error("Erro ao carregar produtos")
      setProdutos([]) // Garantir que seja um array vazio em caso de erro
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
        setCategorias(Array.isArray(data.categorias) ? data.categorias : [])
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
      setCategorias([])
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
      if (searchTerm !== "") {
        fetchProdutos(1, ativo, categoria)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  // Filtrar produtos com base na busca
  const filteredProdutos = Array.isArray(produtos)
    ? produtos.filter((produto) => {
        const matchBusca = searchTerm
          ? produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false ||
            produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false ||
            produto.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false
          : true

        return matchBusca
      })
    : []

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          ) : filteredProdutos.length === 0 ? (
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
              {filteredProdutos.map((produto) => (
                <Link href={`/dashboard/produtos/${produto._id}`} key={produto._id}>
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden h-full flex flex-col">
                    {/* Imagem do produto */}
                    <div className="relative aspect-square w-full bg-gray-100">
                      {produto.imagens && produto.imagens.length > 0 ? (
                        <img
                          src={produto.imagens[0] || "/placeholder.svg"}
                          alt={produto.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Badges de status */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {produto.ativo && (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            Ativo
                          </Badge>
                        )}
                        {!produto.ativo && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                            Inativo
                          </Badge>
                        )}
                        {produto.destaque && (
                          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                            Destaque
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="flex-1 flex flex-col p-4">
                      <h3 className="font-medium text-lg line-clamp-1 mb-1">{produto.nome}</h3>

                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3 flex-grow">
                        {produto.descricaoCurta || produto.descricao || "Sem descrição"}
                      </p>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              {formatarValor(produto.precoPromocional || produto.preco)}
                            </p>
                            {produto.precoPromocional && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatarValor(produto.preco)}
                              </p>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {produto.categoria && (
                              <Badge variant="outline" className="text-xs">
                                {produto.categoria}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                          <span>SKU: {produto.sku || "N/A"}</span>
                          <span>Estoque: {produto.estoque || 0}</span>
                        </div>
                      </div>
                    </CardContent>
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
              {filteredProdutos
                .filter((p) => p.ativo)
                .map((produto) => (
                  <Link href={`/dashboard/produtos/${produto._id}`} key={produto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden h-full flex flex-col">
                      {/* Imagem do produto */}
                      <div className="relative aspect-square w-full bg-gray-100">
                        {produto.imagens && produto.imagens.length > 0 ? (
                          <img
                            src={produto.imagens[0] || "/placeholder.svg"}
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}

                        {/* Badges de status */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            Ativo
                          </Badge>
                          {produto.destaque && (
                            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                              Destaque
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="flex-1 flex flex-col p-4">
                        <h3 className="font-medium text-lg line-clamp-1 mb-1">{produto.nome}</h3>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 flex-grow">
                          {produto.descricaoCurta || produto.descricao || "Sem descrição"}
                        </p>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-primary">
                                {formatarValor(produto.precoPromocional || produto.preco)}
                              </p>
                              {produto.precoPromocional && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatarValor(produto.preco)}
                                </p>
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {produto.categoria && (
                                <Badge variant="outline" className="text-xs">
                                  {produto.categoria}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                            <span>SKU: {produto.sku || "N/A"}</span>
                            <span>Estoque: {produto.estoque || 0}</span>
                          </div>
                        </div>
                      </CardContent>
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
              {filteredProdutos
                .filter((p) => !p.ativo)
                .map((produto) => (
                  <Link href={`/dashboard/produtos/${produto._id}`} key={produto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden h-full flex flex-col opacity-70">
                      {/* Imagem do produto */}
                      <div className="relative aspect-square w-full bg-gray-100">
                        {produto.imagens && produto.imagens.length > 0 ? (
                          <img
                            src={produto.imagens[0] || "/placeholder.svg"}
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}

                        {/* Badges de status */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                            Inativo
                          </Badge>
                          {produto.destaque && (
                            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                              Destaque
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="flex-1 flex flex-col p-4">
                        <h3 className="font-medium text-lg line-clamp-1 mb-1">{produto.nome}</h3>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 flex-grow">
                          {produto.descricaoCurta || produto.descricao || "Sem descrição"}
                        </p>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-primary">
                                {formatarValor(produto.precoPromocional || produto.preco)}
                              </p>
                              {produto.precoPromocional && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatarValor(produto.preco)}
                                </p>
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {produto.categoria && (
                                <Badge variant="outline" className="text-xs">
                                  {produto.categoria}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                            <span>SKU: {produto.sku || "N/A"}</span>
                            <span>Estoque: {produto.estoque || 0}</span>
                          </div>
                        </div>
                      </CardContent>
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
              {filteredProdutos
                .filter((p) => p.destaque)
                .map((produto) => (
                  <Link href={`/dashboard/produtos/${produto._id}`} key={produto._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden h-full flex flex-col">
                      {/* Imagem do produto */}
                      <div className="relative aspect-square w-full bg-gray-100">
                        {produto.imagens && produto.imagens.length > 0 ? (
                          <img
                            src={produto.imagens[0] || "/placeholder.svg"}
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}

                        {/* Badges de status */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                            Destaque
                          </Badge>
                          {produto.ativo ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="flex-1 flex flex-col p-4">
                        <h3 className="font-medium text-lg line-clamp-1 mb-1">{produto.nome}</h3>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 flex-grow">
                          {produto.descricaoCurta || produto.descricao || "Sem descrição"}
                        </p>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-primary">
                                {formatarValor(produto.precoPromocional || produto.preco)}
                              </p>
                              {produto.precoPromocional && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatarValor(produto.preco)}
                                </p>
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {produto.categoria && (
                                <Badge variant="outline" className="text-xs">
                                  {produto.categoria}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                            <span>SKU: {produto.sku || "N/A"}</span>
                            <span>Estoque: {produto.estoque || 0}</span>
                          </div>
                        </div>
                      </CardContent>
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
