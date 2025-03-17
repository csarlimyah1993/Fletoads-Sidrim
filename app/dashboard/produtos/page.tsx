"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Search, Tag, Package, DollarSign, Edit, Eye, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"

interface Produto {
  _id: string
  nome: string
  preco: number
  precoPromocional?: number
  categoria: string
  sku: string
  estoque: number
  destaque: boolean
  ativo: boolean
  imagens: string[]
  dataCriacao: string
}

export default function ProdutosPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/produtos")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao buscar produtos")
        }

        const data = await response.json()
        // Verificar a estrutura da resposta e extrair o array de produtos
        const produtosArray = Array.isArray(data) ? data : data.produtos ? data.produtos : []

        setProdutos(produtosArray)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        setError(error instanceof Error ? error.message : "Erro ao buscar produtos")
        toast.error("Erro ao carregar produtos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProdutos()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Garantir que produtos é sempre um array antes de chamar filter
  const filteredProdutos = Array.isArray(produtos)
    ? produtos.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.sku.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-lg font-medium text-center">{error}</p>
            <Button onClick={() => router.refresh()} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">Gerencie os produtos da sua loja</p>
        </div>
        <Button onClick={() => router.push("/dashboard/produtos/novo")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Produtos</CardTitle>
          <CardDescription>
            Total de {produtos.length} produto{produtos.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {filteredProdutos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Tente buscar com outros termos" : "Comece adicionando seu primeiro produto"}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push("/dashboard/produtos/novo")} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutos.map((produto) => (
                    <TableRow key={produto._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted relative">
                            {produto.imagens && produto.imagens.length > 0 ? (
                              <Image
                                src={produto.imagens[0] || "/placeholder.svg"}
                                alt={produto.nome}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{produto.nome}</p>
                            <p className="text-xs text-muted-foreground">SKU: {produto.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {produto.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{formatCurrency(produto.preco)}</span>
                          {produto.precoPromocional && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(produto.preco)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={produto.estoque > 0 ? "outline" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="h-3 w-3" />
                          {produto.estoque > 0 ? `${produto.estoque} unid.` : "Esgotado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        {produto.destaque && (
                          <Badge variant="outline" className="ml-1 bg-amber-100">
                            Destaque
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/produtos/${produto._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/vitrine/${produto._id}`)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualizar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

