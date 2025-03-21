"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search, Package, Filter, Tag } from "lucide-react"
import Link from "next/link"
import { ResourceLimitsCard } from "@/components/dashboard/resource-limits-card"
import { PlanUpgradeBanner } from "@/components/dashboard/plan-upgrade-banner"
import { Image } from "@/components/ui/image"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Produto {
  _id: string
  nome: string
  preco: number
  estoque: number
  categoria: string
  imagem: string
}

export default function ProdutosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categorias, setCategorias] = useState<{ nome: string; count: number }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/produtos")

        if (!response.ok) {
          throw new Error("Falha ao carregar produtos")
        }

        const data = await response.json()
        setProdutos(data)

        // Calcular categorias e contagens
        const categoriasMap = data.reduce((acc: Record<string, number>, produto: Produto) => {
          if (produto.categoria) {
            acc[produto.categoria] = (acc[produto.categoria] || 0) + 1
          }
          return acc
        }, {})

        const categoriasArray = Object.entries(categoriasMap).map(([nome, count]) => ({
          nome,
          count: count as number,
        }))

        setCategorias(categoriasArray)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProdutos()
  }, [toast])

  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PlanUpgradeBanner />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
        <Button asChild>
          <Link href="/dashboard/produtos/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seus Produtos</CardTitle>
              <CardDescription>Gerencie seu catálogo de produtos.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filtrar</span>
                </Button>
              </div>

              <Tabs defaultValue="todos">
                <TabsList className="mb-4">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="em-estoque">Em Estoque</TabsTrigger>
                  <TabsTrigger value="sem-estoque">Sem Estoque</TabsTrigger>
                </TabsList>

                <TabsContent value="todos" className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredProdutos.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredProdutos.map((produto) => (
                        <Card key={produto._id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row">
                              <div className="relative h-40 w-full sm:w-40">
                                <Image
                                  src={produto.imagem || "/placeholder.svg"}
                                  alt={produto.nome}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="p-4 flex-1">
                                <div className="font-medium">{produto.nome}</div>
                                <div className="text-sm text-muted-foreground mb-2">{produto.categoria}</div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-bold text-lg">
                                    R$ {produto.preco.toFixed(2).replace(".", ",")}
                                  </div>
                                  <div
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                      produto.estoque > 0
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    }`}
                                  >
                                    {produto.estoque > 0 ? `${produto.estoque} em estoque` : "Sem estoque"}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="mt-2">
                                  <Link href={`/dashboard/produtos/${produto._id}`}>Ver detalhes</Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm
                          ? `Não encontramos produtos com "${searchTerm}"`
                          : "Você ainda não cadastrou nenhum produto"}
                      </p>
                      {!searchTerm && (
                        <Button className="mt-4" asChild>
                          <Link href="/dashboard/produtos/novo">Cadastrar seu primeiro produto</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="em-estoque" className="space-y-4">
                  {/* Conteúdo similar para produtos em estoque */}
                </TabsContent>

                <TabsContent value="sem-estoque" className="space-y-4">
                  {/* Conteúdo similar para produtos sem estoque */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <ResourceLimitsCard />

          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>Organização do seu catálogo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : categorias.length > 0 ? (
                categorias.map((categoria) => (
                  <div key={categoria.nome} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{categoria.nome}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{categoria.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">Nenhuma categoria encontrada</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/produtos/categorias">Gerenciar Categorias</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

