"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Plus, Search, Grid2x2, List, Eye, Heart, Share2, MessageSquare, Edit, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdicionarProdutoDrawer } from "@/components/adicionar-produto-drawer"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define product interface for better type safety
interface Product {
  id: number
  nome: string
  descricao: string
  categoria: string
  precoOriginal: number
  preco: number
  imagem: string
  status: string
  tipo: string
  stats: {
    views: number
    likes: number
    shares: number
    comments: number
  }
}

export function VitrineContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState("detalhes")

  const produtos: Product[] = [
    {
      id: 1,
      nome: "Tênis Casual Masculino",
      descricao: "Tênis casual em couro legítimo com solado em borracha",
      categoria: "Calçados",
      precoOriginal: 349.9,
      preco: 299.9,
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
      tipo: "produto",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
    },
    {
      id: 2,
      nome: "Sapatilha Creme Em Couro Com Lacinho",
      descricao: "Sapatilha feminina em couro legítimo com detalhe em laço",
      categoria: "Calçados",
      precoOriginal: 189.9,
      preco: 159.9,
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
      tipo: "panfleto",
      stats: { views: 542, likes: 98, shares: 32, comments: 64 },
    },
    {
      id: 3,
      nome: "Tênis Terracota Com Solado Em Borracha",
      descricao: "Tênis na cor terracota com solado em borracha antiderrapante",
      categoria: "Calçados",
      precoOriginal: 229.9,
      preco: 199.9,
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
      tipo: "hotpromo",
      stats: { views: 623, likes: 145, shares: 41, comments: 87 },
    },
  ]

  // Fix: Add proper type annotation for the event parameter
  const handleAddProduto = (e: React.MouseEvent<HTMLButtonElement> | null) => {
    if (e) e.preventDefault()
    setDrawerOpen(true)
  }

  // Fix: Add proper type annotation for the product parameter
  const handleCardClick = (produto: Product) => {
    setSelectedProduct(produto)
    setActiveTab("detalhes")
  }

  // Fix: Add proper type annotations for event and product parameters
  const handleEditProduto = (e: React.MouseEvent<HTMLButtonElement>, produto: Product) => {
    e.stopPropagation()
    setSelectedProduct(produto)
    setActiveTab("detalhes")
  }

  const handleCloseProductView = () => {
    setSelectedProduct(null)
  }

  // Conteúdo das abas do produto
  const renderProductTabContent = () => {
    if (!selectedProduct) return null

    switch (activeTab) {
      case "detalhes":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={selectedProduct.imagem || "/placeholder.svg"}
                    alt={selectedProduct.nome}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedProduct.nome}</h3>
                  <p className="text-gray-500">{selectedProduct.descricao}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Categoria</h4>
                    <p>{selectedProduct.categoria}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <Badge variant={selectedProduct.status === "ativo" ? "success" : "secondary"}>
                      {selectedProduct.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Preço Original</h4>
                    <p className="line-through">R$ {selectedProduct.precoOriginal.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Preço Atual</h4>
                    <p className="font-bold text-orange-500">R$ {selectedProduct.preco.toFixed(2)}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="mr-2">Editar Produto</Button>
                  <Button variant="outline">Visualizar na Loja</Button>
                </div>
              </div>
            </div>
          </div>
        )
      case "precos":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Preços e Estoque</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Preço Original (R$)</label>
                  <Input type="number" defaultValue={selectedProduct.precoOriginal} />
                </div>
                <div>
                  <label className="text-sm font-medium">Preço Promocional (R$)</label>
                  <Input type="number" defaultValue={selectedProduct.preco} />
                </div>
                <div>
                  <label className="text-sm font-medium">Custo (R$)</label>
                  <Input type="number" placeholder="Custo do produto" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Estoque</label>
                  <Input type="number" placeholder="Quantidade em estoque" />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <Input placeholder="Código de referência" />
                </div>
                <div>
                  <label className="text-sm font-medium">Código de Barras</label>
                  <Input placeholder="EAN / GTIN" />
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Button>Salvar Alterações</Button>
            </div>
          </div>
        )
      case "variacoes":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Variações do Produto</h3>
            <p className="text-gray-500">Adicione opções como tamanhos, cores ou outros atributos.</p>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Variações</h4>
                <Button size="sm">Adicionar Variação</Button>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma variação cadastrada</p>
                <p className="text-sm">Clique em "Adicionar Variação" para começar</p>
              </div>
            </div>
          </div>
        )
      case "imagens":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Imagens do Produto</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={selectedProduct.imagem || "/placeholder.svg"}
                  alt="Imagem principal"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="ghost" size="icon" className="text-white">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      case "seo":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Otimização para Motores de Busca (SEO)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título SEO</label>
                <Input defaultValue={selectedProduct.nome} />
                <p className="text-xs text-gray-500 mt-1">Recomendado: 50-60 caracteres</p>
              </div>
              <div>
                <label className="text-sm font-medium">Descrição SEO</label>
                <Input defaultValue={selectedProduct.descricao} />
                <p className="text-xs text-gray-500 mt-1">Recomendado: 150-160 caracteres</p>
              </div>
              <div>
                <label className="text-sm font-medium">URL amigável</label>
                <Input defaultValue={selectedProduct.nome.toLowerCase().replace(/\s+/g, "-")} />
              </div>
            </div>
            <div className="pt-4">
              <Button>Salvar Alterações</Button>
            </div>
          </div>
        )
      case "avaliacoes":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Avaliações do Produto</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold">4.7</div>
                <div className="text-sm text-gray-500">de 5 estrelas</div>
              </div>
              <div className="flex-1">
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <div className="text-xs w-8">{star} ★</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{
                            width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs w-8 text-right">
                        {star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border rounded-lg divide-y">
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">João Silva</div>
                  <div className="text-yellow-500">★★★★★</div>
                </div>
                <p className="text-sm text-gray-600">
                  Produto excelente! Superou minhas expectativas em qualidade e conforto.
                </p>
                <div className="text-xs text-gray-400 mt-2">12/03/2023</div>
              </div>
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Maria Oliveira</div>
                  <div className="text-yellow-500">★★★★☆</div>
                </div>
                <p className="text-sm text-gray-600">Muito bom, mas poderia ter mais opções de cores.</p>
                <div className="text-xs text-gray-400 mt-2">28/02/2023</div>
              </div>
            </div>
          </div>
        )
      case "estatisticas":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Estatísticas do Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-gray-500">Visualizações</div>
                <div className="text-2xl font-bold">{selectedProduct.stats.views}</div>
                <div className="text-xs text-green-500">+12% esta semana</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Curtidas</div>
                <div className="text-2xl font-bold">{selectedProduct.stats.likes}</div>
                <div className="text-xs text-green-500">+8% esta semana</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Compartilhamentos</div>
                <div className="text-2xl font-bold">{selectedProduct.stats.shares}</div>
                <div className="text-xs text-green-500">+5% esta semana</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Comentários</div>
                <div className="text-2xl font-bold">{selectedProduct.stats.comments}</div>
                <div className="text-xs text-green-500">+15% esta semana</div>
              </Card>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-4">Desempenho nos últimos 30 dias</h4>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Gráfico de desempenho do produto</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", transition: { duration: 0.2 } },
  }

  const productViewVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="h-auto min-h-[calc(100vh-4rem)]">
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {!selectedProduct ? (
            // Lista de produtos
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Produto</h1>
                  <p className="text-gray-500">Gerencie seus produtos e serviços</p>
                </div>
                <Button onClick={(e) => handleAddProduto(e)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Input placeholder="Buscar produtos..." className="w-full pl-10" />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Grid2x2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {produtos.map((produto, index) => (
                    <motion.div
                      key={produto.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        onClick={() => handleCardClick(produto)}
                      >
                        <div className="relative aspect-square bg-gray-100 overflow-hidden group">
                          <Image
                            src={produto.imagem || "/placeholder.svg"}
                            alt={produto.nome}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute left-2 top-2">
                            <Badge
                              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all duration-300 shadow-md"
                              onMouseEnter={() => setHoveredProduct(produto.id)}
                              onMouseLeave={() => setHoveredProduct(null)}
                            >
                              PRODUTO
                            </Badge>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                            onClick={(e) => handleEditProduto(e, produto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Badge variant="outline" className="text-xs font-normal">
                              {produto.categoria}
                            </Badge>
                          </div>
                          <h3 className="text-sm font-medium line-clamp-2 h-10 my-1">{produto.nome}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{produto.descricao}</p>
                          <div className="mt-1 mb-2">
                            <p className="text-xs text-gray-500 line-through">R$ {produto.precoOriginal.toFixed(2)}</p>
                            <p className="text-lg font-bold text-orange-500">R$ {produto.preco.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{produto.stats.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{produto.stats.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="h-3 w-3" />
                              <span>{produto.stats.shares}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{produto.stats.comments}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </>
          ) : (
            // Visualização detalhada do produto
            <motion.div
              variants={productViewVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-lg shadow-sm border"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={handleCloseProductView}>
                    <X className="h-5 w-5" />
                  </Button>
                  <h2 className="text-xl font-semibold">{selectedProduct.nome}</h2>
                </div>
                <Button variant="outline" size="sm">
                  Publicar
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b">
                  <div className="px-4 overflow-x-auto">
                    <TabsList className="h-12">
                      <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                      <TabsTrigger value="precos">Preços e Estoque</TabsTrigger>
                      <TabsTrigger value="variacoes">Variações</TabsTrigger>
                      <TabsTrigger value="imagens">Imagens</TabsTrigger>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                      <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
                      <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <div className="p-6">
                  <TabsContent value={activeTab} forceMount={true}>
                    {renderProductTabContent()}
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          )}
        </div>
      </div>

      <AdicionarProdutoDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
