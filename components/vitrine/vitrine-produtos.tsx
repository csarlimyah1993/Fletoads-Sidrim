"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, ShoppingCart, Heart } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { VitrineProdutosProps } from "@/types/vitrine"

const VitrineProdutos: React.FC<VitrineProdutosProps> = ({
  loja,
  config,
  produtos,
  categorias,
  categoriaAtiva,
  setCategoriaAtiva,
  favoritos,
  toggleFavorito,
}) => {
  const [layout, setLayout] = useState(config?.layout || "padrao")
  const [visibleProducts, setVisibleProducts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const productsPerPage = 8

  useEffect(() => {
    // Initialize visible products
    const initialProducts = produtos.slice(0, productsPerPage)
    setVisibleProducts(initialProducts)
    console.log("Produtos inicializados:", initialProducts.length)
  }, [produtos])

  const loadMoreProducts = () => {
    const nextPage = page + 1
    const nextProducts = produtos.slice(0, nextPage * productsPerPage)
    setVisibleProducts(nextProducts)
    setPage(nextPage)
  }

  // Animation variants for products
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (!produtos || produtos.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Produtos</h2>
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nenhum produto disponível no momento.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4" id="produtos">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Nossos Produtos</h2>

        {/* Categorias */}
        {categorias && categorias.length > 0 && (
          <div className="mb-8">
            <Tabs
              defaultValue={categoriaAtiva || "todos"}
              onValueChange={(value) => setCategoriaAtiva(value === "todos" ? null : value)}
            >
              <TabsList className="flex flex-wrap justify-center">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                {categorias.map((categoria) => (
                  <TabsTrigger key={categoria} value={categoria}>
                    {categoria}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Layout Selector */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
            <Button
              variant={layout === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLayout("grid")}
              className="h-8 w-8 p-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
            </Button>
            <Button
              variant={layout === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLayout("list")}
              className="h-8 w-8 p-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>

        {/* Products Grid/List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : "flex flex-col space-y-4",
          )}
        >
          {visibleProducts.map((produto) => (
            <motion.div key={produto._id} variants={itemVariants}>
              <Card
                className={cn(
                  "h-full overflow-hidden transition-all duration-300 hover:shadow-lg",
                  layout === "list" && "flex flex-row",
                )}
              >
                <div
                  className={cn(
                    "relative overflow-hidden",
                    layout === "grid" ? "aspect-square" : "w-1/3 min-w-[120px]",
                  )}
                >
                  {produto.imagens && produto.imagens.length > 0 ? (
                    <Image
                      src={produto.imagens[0] || "/placeholder.svg"}
                      alt={produto.nome}
                      fill
                      sizes="100vw"
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {config?.mostrarPromocoes && produto.precoPromocional && produto.precoPromocional < produto.preco && (
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded-md text-sm font-bold"
                      style={{ backgroundColor: config?.corDestaque || "#f59e0b", color: "#ffffff" }}
                    >
                      {Math.round(((produto.preco - produto.precoPromocional) / produto.preco) * 100)}% OFF
                    </div>
                  )}

                  {toggleFavorito && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorito(produto)
                      }}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-all"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          favoritos?.includes(produto._id) ? "fill-red-500 text-red-500" : "text-gray-600",
                        )}
                      />
                    </button>
                  )}
                </div>

                <CardContent className={cn("flex flex-col p-4", layout === "list" && "flex-1")}>
                  <h3 className="font-bold text-lg line-clamp-2">{produto.nome}</h3>

                  {produto.descricaoCurta && (
                    <p className="text-sm mt-1 line-clamp-2 text-gray-500 dark:text-gray-300">
                      {produto.descricaoCurta}
                    </p>
                  )}

                  {config?.mostrarPrecos !== false && (
                    <div className="mt-2">
                      {produto.precoPromocional && produto.precoPromocional < produto.preco ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 line-through text-sm">
                            {produto.preco.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                          <span
                            className="font-bold text-lg"
                            style={{ color: config?.corDestaque || config?.corPrimaria || "#f59e0b" }}
                          >
                            {produto.precoPromocional.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-lg">
                          {produto.preco.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </div>
                  )}

                  {config?.mostrarEstoque && produto.estoque !== undefined && (
                    <div className="mt-2 text-sm">
                      {produto.estoque > 0 ? (
                        <span className="text-green-600">Em estoque: {produto.estoque} unidades</span>
                      ) : (
                        <span className="text-red-600">Fora de estoque</span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex gap-2">
                    <Button
                      className="flex-1"
                      style={{
                        backgroundColor: config?.corPrimaria || "#3b82f6",
                        color: config?.corTexto || "#ffffff",
                      }}
                    >
                      Ver detalhes
                    </Button>

                    {config?.mostrarCompartilhar && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Implement share functionality
                          if (navigator.share) {
                            navigator.share({
                              title: produto.nome,
                              text: produto.descricaoCurta || `Confira ${produto.nome}`,
                              url: window.location.href,
                            })
                          } else {
                            navigator.clipboard.writeText(window.location.href)
                            alert("Link copiado para a área de transferência!")
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Button */}
        {visibleProducts.length < produtos.length && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={loadMoreProducts}
              variant="outline"
              style={{
                borderColor: config?.corPrimaria || "#3b82f6",
                color: config?.corPrimaria || "#3b82f6",
              }}
            >
              Carregar mais produtos
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default VitrineProdutos
