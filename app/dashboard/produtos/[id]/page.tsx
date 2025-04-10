"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Info, Tag, Package, Truck, Settings, AlertCircle, Trash, Edit, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useParams } from "next/navigation"

interface Produto {
  _id: string
  nome: string
  descricaoCurta?: string
  descricaoCompleta?: string
  preco: number
  precoPromocional?: number
  estoque: number
  sku?: string
  codigoBarras?: string
  imagens: string[]
  videoUrl?: string
  categoria?: string
  subcategoria?: string
  tags?: string[]
  marca?: string
  modelo?: string
  peso?: number
  altura?: number
  largura?: number
  comprimento?: number
  tipoFrete?: string
  ativo: boolean
  destaque?: boolean
  tipoProduto?: string
  variacoes?: Array<{
    nome: string
    opcoes: Array<{
      nome: string
      preco?: number
      estoque?: number
    }>
  }>
  dataCriacao: string
  dataAtualizacao?: string
}

export default function ProdutoDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Extrair o ID do produto de forma segura usando useParams
  const produtoId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : ""

  useEffect(() => {
    const fetchProduto = async () => {
      if (!produtoId) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/produtos/${produtoId}`)
        if (!response.ok) {
          throw new Error(`Erro ao buscar produto: ${response.status}`)
        }
        const data = await response.json()
        setProduto(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro!",
          description: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduto()
  }, [produtoId, toast])

  const handleDelete = async () => {
    if (!produtoId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/produtos/${produtoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Erro ao excluir produto: ${response.status}`)
      }

      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso.",
      })
      router.push("/dashboard/produtos")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: error.message,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <AlertCircle className="mr-2 h-4 w-4" />
        Produto não encontrado.
      </div>
    )
  }

  // Verificar se o produto é digital ou serviço
  const isPhysicalProduct = produto.tipoProduto === "fisico"

  return (
    <div className="container relative pb-10">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{produto.nome}</h2>
        <p className="text-muted-foreground">Detalhes e informações sobre o produto.</p>
      </div>
      <Separator className="my-4" />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="basic">
            <Info className="mr-2 h-4 w-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="price">
            <Tag className="mr-2 h-4 w-4" />
            Preço
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" />
            Estoque
          </TabsTrigger>
          {isPhysicalProduct && (
            <TabsTrigger value="shipping">
              <Truck className="mr-2 h-4 w-4" />
              Entrega
            </TabsTrigger>
          )}
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                  <CardDescription>Detalhes básicos do produto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nome</p>
                    <p className="text-muted-foreground">{produto.nome}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Descrição Curta</p>
                    <p className="text-muted-foreground">{produto.descricaoCurta || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Categoria</p>
                    <p className="text-muted-foreground">{produto.categoria || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">SKU</p>
                    <p className="text-muted-foreground">{produto.sku || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes Adicionais</CardTitle>
                  <CardDescription>Mais informações sobre o produto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Marca</p>
                    <p className="text-muted-foreground">{produto.marca || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Modelo</p>
                    <p className="text-muted-foreground">{produto.modelo || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tipo de Produto</p>
                    <p className="text-muted-foreground">
                      {produto.tipoProduto === "fisico"
                        ? "Físico"
                        : produto.tipoProduto === "digital"
                          ? "Digital"
                          : produto.tipoProduto === "servico"
                            ? "Serviço"
                            : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>Palavras-chave associadas ao produto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {produto.tags && produto.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {produto.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma tag associada.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="price" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Preço</CardTitle>
                <CardDescription>Detalhes sobre o preço do produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Preço</p>
                  <p className="text-muted-foreground">{formatCurrency(produto.preco)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Preço Promocional</p>
                  <p className="text-muted-foreground">
                    {produto.precoPromocional ? formatCurrency(produto.precoPromocional) : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Estoque</CardTitle>
                <CardDescription>Detalhes sobre o estoque do produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Estoque</p>
                  <p className="text-muted-foreground">{produto.estoque}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isPhysicalProduct && (
            <TabsContent value="shipping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Entrega</CardTitle>
                  <CardDescription>Detalhes sobre as dimensões e peso do produto para entrega</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Peso</p>
                    <p className="text-muted-foreground">{produto.peso || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Altura</p>
                    <p className="text-muted-foreground">{produto.altura || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Largura</p>
                    <p className="text-muted-foreground">{produto.largura || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Comprimento</p>
                    <p className="text-muted-foreground">{produto.comprimento || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tipo de Frete</p>
                    <p className="text-muted-foreground">{produto.tipoFrete || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Produto</CardTitle>
                <CardDescription>Opções para gerenciar o produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Ativo</p>
                  <p className="text-muted-foreground">{produto.ativo ? "Sim" : "Não"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Destaque</p>
                  <p className="text-muted-foreground">{produto.destaque ? "Sim" : "Não"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
      <Separator className="my-4" />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => router.push(`/dashboard/produtos/editar/${produtoId}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Excluir
        </Button>
      </div>
    </div>
  )
}
