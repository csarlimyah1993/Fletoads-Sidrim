import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ExternalLink, Heart, Star, TrendingUp, Tag } from "lucide-react"
import type { Loja, Produto } from "@/types/loja"

interface VitrineProdutosProps {
  loja: Loja
  produtos: Produto[]
}

export function VitrineProdutos({ loja, produtos }: VitrineProdutosProps) {
  const isPlanoPago = loja.plano?.id !== "gratis"

  // Definir cores com base no plano
  const corPrimaria = loja.cores?.primaria || "#4f46e5"

  if (!produtos || produtos.length === 0) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">Produtos</h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-12 text-center shadow-sm max-w-2xl mx-auto">
            <div className="mb-6">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-medium mb-4 dark:text-white">Nenhum produto disponível</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Estamos trabalhando para adicionar produtos em breve. Fique de olho!
            </p>
            <Link href={`/vitrine/${loja._id}/contato`}>
              <Button className="mt-2" style={{ backgroundColor: corPrimaria }}>
                Entre em contato
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Destacar alguns produtos aleatoriamente
  const destaques = [...produtos].sort(() => 0.5 - Math.random()).slice(0, Math.min(3, produtos.length))

  return (
    <>
      {/* Seção de destaques */}
      {destaques.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Destaques</h2>
                <p className="text-gray-300 mt-2">Produtos em destaque para você</p>
              </div>

              <Link href={`/vitrine/${loja._id}/produtos`}>
                <Button variant="outline" className="border-white text-white hover:bg-white/20">
                  Ver todos
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {destaques.map((produto) => (
                <Card
                  key={produto._id.toString()}
                  className="bg-white/10 backdrop-blur-sm border-0 overflow-hidden group"
                >
                  <div className="aspect-square relative">
                    {produto.imagens && produto.imagens.length > 0 ? (
                      <img
                        src={produto.imagens[0] || "/placeholder.svg"}
                        alt={produto.nome}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-700">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Destaque
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{produto.nome}</h3>

                    {produto.categoria && <p className="text-xs text-gray-300 mb-2">{produto.categoria}</p>}

                    <div className="flex justify-between items-center mt-4">
                      <p className="font-bold text-xl">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(produto.preco)}
                      </p>

                      <Button className="bg-white text-gray-900 hover:bg-gray-100" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Comprar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seção principal de produtos */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold dark:text-white">Nossos Produtos</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Explore nossa seleção de produtos</p>
            </div>

            {produtos.length > 8 && (
              <Link href={`/vitrine/${loja._id}/produtos`}>
                <Button
                  variant="outline"
                  className="dark:border-gray-700 dark:text-gray-300"
                  style={{ borderColor: corPrimaria, color: corPrimaria }}
                >
                  Ver todos
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.slice(0, 8).map((produto) => (
              <Card
                key={produto._id.toString()}
                className="overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-700 group hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {produto.imagens && produto.imagens.length > 0 ? (
                    <img
                      src={produto.imagens[0] || "/placeholder.svg"}
                      alt={produto.nome}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                        e.currentTarget.className = "object-contain p-4 w-full h-full"
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <span className="text-gray-400 dark:text-gray-500">Sem imagem</span>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {Math.random() > 0.7 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        Oferta
                      </span>
                    </div>
                  )}

                  {Math.random() > 0.8 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Novo
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-medium mb-1 line-clamp-1 dark:text-white">{produto.nome}</h3>

                  {produto.categoria && isPlanoPago && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{produto.categoria}</p>
                  )}

                  {produto.descricao && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{produto.descricao}</p>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold text-lg dark:text-white">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(produto.preco)}
                    </p>

                    {isPlanoPago && (
                      <Button size="sm" className="h-8 w-8 p-0 rounded-full" style={{ backgroundColor: corPrimaria }}>
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only">Adicionar ao carrinho</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

