"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProdutoCard } from "./produto-card"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Produto } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

export function ProdutosList() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const router = useRouter()
  const { toast } = useToast()

  // Default vitrine config
  const defaultConfig: VitrineConfig = {
    corPrimaria: "#3b82f6",
    corSecundaria: "#f59e0b",
    corTexto: "#ffffff",
    corFundo: "#ffffff",
    corDestaque: "#f59e0b",
    tema: "claro",
    mostrarPrecos: true,
    mostrarEstoque: true,
    mostrarAvaliacao: false,
    mostrarPromocoes: true,
    mostrarCompartilhar: true,
  }

  // Share handler function
  const handleShare = (produto: Produto) => {
    if (navigator.share) {
      navigator
        .share({
          title: produto.nome || "",
          text: produto.descricaoCurta || produto.descricao || "",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      toast({
        title: "Link copiado",
        description: "O link do produto foi copiado para a área de transferência.",
      })
      navigator.clipboard.writeText(window.location.href)
    }
  }

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true)
        console.log("Buscando produtos...")

        // Usar a rota API existente
        const response = await fetch("/api/produtos")
        if (!response.ok) {
          throw new Error(`Falha ao carregar produtos: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Resposta da API:", data)

        // Garantir que temos um array de produtos
        // Verificar se a resposta é um array ou um objeto com propriedade produtos
        let produtosArray: any[] = []

        if (Array.isArray(data)) {
          produtosArray = data
        } else if (data && typeof data === "object") {
          // Tentar extrair produtos de várias propriedades possíveis
          if (Array.isArray(data.produtos)) {
            produtosArray = data.produtos
          } else if (Array.isArray(data.data)) {
            produtosArray = data.data
          } else if (Array.isArray(data.items)) {
            produtosArray = data.items
          } else if (Array.isArray(data.results)) {
            produtosArray = data.results
          }
        }

        console.log(`Produtos encontrados: ${produtosArray.length}`)

        if (produtosArray.length === 0) {
          console.log("Nenhum produto encontrado na resposta da API")
          setProdutos([])
          return
        }

        // Mapear os produtos para garantir que todos os campos necessários estejam presentes
        const transformedData = produtosArray.map((item: any) => {
          console.log("Processando produto:", item)
          return {
            _id: item._id,
            nome: item.nome || "",
            descricao: item.descricao || item.descricaoCompleta || "",
            descricaoCurta: item.descricaoCurta || "",
            preco: item.preco || 0,
            precoPromocional: item.precoPromocional,
            imagens: item.imagens || [],
            estoque: item.estoque || 0,
            dataCriacao: item.dataCriacao || item.createdAt,
            dataAtualizacao: item.dataAtualizacao || item.updatedAt,
            ativo: item.ativo !== undefined ? item.ativo : true,
            destaque: item.destaque || false,
            categoria: item.categoria || "", // Mantido para compatibilidade
            categorias: item.categorias || [], // Usando categorias
            lojaId: item.lojaId || "",
          }
        })

        console.log("Dados transformados:", transformedData)
        setProdutos(transformedData)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus produtos. Tente novamente mais tarde.",
          variant: "destructive",
        })
        setProdutos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProdutos()
  }, [toast])

  const filteredProdutos = produtos.filter(
    (produto) =>
      (produto.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (produto.descricao || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (produto.categoria || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (produto.categorias || []).some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const produtosAtivos = filteredProdutos.filter((p) => p.ativo)
  const produtosInativos = filteredProdutos.filter((p) => !p.ativo)
  const produtosDestaque = filteredProdutos.filter((p) => p.destaque)

  const getActiveProducts = () => {
    switch (activeTab) {
      case "ativos":
        return produtosAtivos
      case "inativos":
        return produtosInativos
      case "destaque":
        return produtosDestaque
      default:
        return filteredProdutos
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar produtos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" title="Filtrar produtos">
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push("/dashboard/produtos/novo")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todos">Todos ({filteredProdutos.length})</TabsTrigger>
          <TabsTrigger value="ativos">Ativos ({produtosAtivos.length})</TabsTrigger>
          <TabsTrigger value="inativos">Inativos ({produtosInativos.length})</TabsTrigger>
          <TabsTrigger value="destaque">Destaque ({produtosDestaque.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {getActiveProducts().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getActiveProducts().map((produto) => (
                <ProdutoCard key={produto._id} produto={produto} config={defaultConfig} onShare={handleShare} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nenhum produto encontrado</CardTitle>
                <CardDescription>
                  {searchQuery
                    ? "Nenhum produto corresponde à sua busca. Tente outros termos."
                    : "Você ainda não criou nenhum produto. Comece criando seu primeiro produto agora!"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push("/dashboard/produtos/novo")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar meu primeiro produto
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
