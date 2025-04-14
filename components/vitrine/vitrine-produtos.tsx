"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingBag, Search } from "lucide-react"
import { ProdutoCard } from "@/components/produtos/produto-card"
import type { VitrineProdutosProps } from "@/types/vitrine"
import { Input } from "@/components/ui/input"

export function VitrineProdutos({
  loja,
  config,
  produtos,
  categorias,
  categoriaAtiva,
  setCategoriaAtiva,
  favoritos,
  toggleFavorito,
}: VitrineProdutosProps) {
  const [layout, setLayout] = useState(config.layout || "padrao")

  // Função para compartilhar produto
  const compartilharProduto = (produto: any) => {
    if (navigator.share) {
      navigator
        .share({
          title: produto.nome,
          text: produto.descricaoCurta || `Confira ${produto.nome}`,
          url: window.location.href,
        })
        .catch((err) => console.error("Erro ao compartilhar:", err))
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
            <p className="text-muted-foreground mt-2">Conheça nossa seleção especial de produtos</p>
          </div>

          {/* Categorias em desktop */}
          {categorias.length > 0 && config.mostrarCategorias && (
            <div className="hidden md:flex items-center gap-2 mt-4 md:mt-0">
              <Button
                variant={categoriaAtiva === null ? "default" : "outline"}
                onClick={() => setCategoriaAtiva(null)}
                style={
                  categoriaAtiva === null
                    ? {
                        backgroundColor: config.corPrimaria,
                        color: config.corTexto,
                      }
                    : {}
                }
              >
                Todos
              </Button>
              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={categoriaAtiva === categoria ? "default" : "outline"}
                  onClick={() => setCategoriaAtiva(categoria)}
                  style={
                    categoriaAtiva === categoria
                      ? {
                          backgroundColor: config.corPrimaria,
                          color: config.corTexto,
                        }
                      : {}
                  }
                >
                  {categoria}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Categorias em mobile */}
        {categorias.length > 0 && config.mostrarCategorias && (
          <div className="md:hidden mb-6">
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex gap-2">
                <Button
                  variant={categoriaAtiva === null ? "default" : "outline"}
                  onClick={() => setCategoriaAtiva(null)}
                  className="whitespace-nowrap"
                  style={
                    categoriaAtiva === null
                      ? {
                          backgroundColor: config.corPrimaria,
                          color: config.corTexto,
                        }
                      : {}
                  }
                >
                  Todos
                </Button>

                {categorias.map((categoria) => (
                  <Button
                    key={categoria}
                    variant={categoriaAtiva === categoria ? "default" : "outline"}
                    onClick={() => setCategoriaAtiva(categoria)}
                    className="whitespace-nowrap"
                    style={
                      categoriaAtiva === categoria
                        ? {
                            backgroundColor: config.corPrimaria,
                            color: config.corTexto,
                          }
                        : {}
                    }
                  >
                    {categoria}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input type="search" placeholder="Buscar produtos..." className="w-full pl-10" />
          </div>
        </div>

        {/* Grid de Produtos */}
        {produtos.length > 0 ? (
          <div
            className={
              layout === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : layout === "magazine"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            }
          >
            {produtos.map((produto, index) => (
              <ProdutoCard
                key={produto._id}
                produto={produto}
                config={config}
                onShare={compartilharProduto}
                onFavorite={toggleFavorito}
                isFavorite={favoritos.includes(produto._id)}
                layout={layout}
                animationProps={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.3, delay: index * 0.05 },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {categoriaAtiva ? "Tente selecionar outra categoria." : "Não há produtos disponíveis no momento."}
            </p>
            {categoriaAtiva && <Button onClick={() => setCategoriaAtiva(null)}>Ver todos os produtos</Button>}
          </div>
        )}
      </div>
    </section>
  )
}
