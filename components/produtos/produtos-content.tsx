"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Plus, Edit, Trash2, Tag } from "lucide-react"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Produto {
  _id: string
  nome: string
  preco: number
  precoPromocional?: number
  estoque: number
  imagem?: string
  ativo: boolean
  emPromocao: boolean
  categoria?: string
  descricao?: string
}

export function ProdutosContent() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { hasFeature } = usePlanFeatures()

  useEffect(() => {
    async function fetchProdutos() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/produtos")

        if (!response.ok) {
          throw new Error(`Erro ao buscar produtos: ${response.status}`)
        }

        const data = await response.json()
        setProdutos(data)
        setError(null)
      } catch (err) {
        console.error("Erro ao buscar produtos:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar produtos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProdutos()
  }, [])

  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const produtosAtivos = filteredProdutos.filter((p) => p.ativo)
  const produtosInativos = filteredProdutos.filter((p) => !p.ativo)
  const produtosPromocao = filteredProdutos.filter((p) => p.emPromocao)

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <Skeleton className="h-12 w-full max-w-md" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Erro ao carregar produtos</h3>
          <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
          <Button
            variant="outline"
            className="mt-4 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (produtos.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
          </Button>
        </div>

        <div className="bg-muted/40 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium">Nenhum produto cadastrado</h3>
          <p className="text-muted-foreground mt-2">Comece adicionando seu primeiro produto.</p>
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="todos" className="flex-1">
            Todos ({filteredProdutos.length})
          </TabsTrigger>
          <TabsTrigger value="ativos" className="flex-1">
            Ativos ({produtosAtivos.length})
          </TabsTrigger>
          <TabsTrigger value="inativos" className="flex-1">
            Inativos ({produtosInativos.length})
          </TabsTrigger>
          <TabsTrigger value="promocao" className="flex-1">
            Promoção ({produtosPromocao.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <ProdutosList produtos={filteredProdutos} />
        </TabsContent>

        <TabsContent value="ativos" className="mt-6">
          <ProdutosList produtos={produtosAtivos} />
        </TabsContent>

        <TabsContent value="inativos" className="mt-6">
          <ProdutosList produtos={produtosInativos} />
        </TabsContent>

        <TabsContent value="promocao" className="mt-6">
          <ProdutosList produtos={produtosPromocao} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProdutosList({ produtos }: { produtos: Produto[] }) {
  if (produtos.length === 0) {
    return (
      <div className="bg-muted/40 border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground mt-2">Tente ajustar seus filtros ou adicione novos produtos.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {produtos.map((produto) => (
        <Card key={produto._id} className={`overflow-hidden ${!produto.ativo ? "opacity-70" : ""}`}>
          <div className="relative h-40 bg-muted">
            {produto.imagem ? (
              <img
                src={produto.imagem || "/placeholder.svg"}
                alt={produto.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                Sem imagem
              </div>
            )}

            {produto.emPromocao && (
              <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                <Tag className="h-3 w-3 mr-1" /> Promoção
              </Badge>
            )}

            {!produto.ativo && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="outline" className="bg-background/80">
                  Inativo
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium line-clamp-1">{produto.nome}</h3>

            <div className="flex justify-between">
              <div>
                {produto.emPromocao && produto.precoPromocional ? (
                  <div className="flex flex-col">
                    <span className="text-sm line-through text-muted-foreground">R$ {produto.preco.toFixed(2)}</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      R$ {produto.precoPromocional.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold">R$ {produto.preco.toFixed(2)}</span>
                )}
              </div>

              <span className="text-sm text-muted-foreground">Estoque: {produto.estoque}</span>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

