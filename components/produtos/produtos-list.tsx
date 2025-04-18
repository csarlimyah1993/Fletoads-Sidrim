"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProdutoCard } from "./produto-card"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { Produto } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

export function ProdutosList() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Default vitrine config using your existing structure
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
    layout: "padrao",
    animacoes: true,
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
      // Fallback for browsers that don't support the Web Share API
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
        const response = await fetch("/api/produtos")
        if (!response.ok) {
          throw new Error("Falha ao carregar produtos")
        }
        const data = await response.json()

        // Transform the data to match the expected property names
        const transformedData = data.map((item: any) => ({
          _id: item._id,
          nome: item.name || item.nome || "",
          descricao: item.description || item.descricao || "",
          descricaoCurta: item.shortDescription || item.descricaoCurta || "",
          preco: item.price || item.preco || 0,
          precoPromocional: item.promotionalPrice || item.precoPromocional,
          imagens: item.images || item.imagens || [],
          estoque: item.stock || item.estoque,
          createdAt: item.createdAt,
          status: item.status || "active",
        }))

        setProdutos(transformedData)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus produtos. Tente novamente mais tarde.",
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
      (produto.nome || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (produto.descricao || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        <Button onClick={() => router.push("/produtos/novo")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {isLoading ? (
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
      ) : filteredProdutos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProdutos.map((produto) => (
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
            <Button onClick={() => router.push("/produtos/novo")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar meu primeiro produto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
