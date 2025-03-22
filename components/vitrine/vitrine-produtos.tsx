import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ExternalLink } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
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
      <section className="py-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">Produtos</h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum produto disponível no momento.</p>
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

  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Produtos</h2>

          {produtos.length > 8 && (
            <Link href={`/vitrine/${loja._id}/produtos`}>
              <Button
                variant="outline"
                size="sm"
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
              className="overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                {produto.imagens && produto.imagens.length > 0 ? (
                  <OptimizedImage
                    src={produto.imagens[0]}
                    alt={produto.nome}
                    fill
                    className="object-cover"
                    fallbackClassName="object-contain p-4"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <span className="text-gray-400 dark:text-gray-500">Sem imagem</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium mb-1 line-clamp-1 dark:text-white">{produto.nome}</h3>

                {produto.categoria && isPlanoPago && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{produto.categoria}</p>
                )}

                <div className="flex justify-between items-center mt-2">
                  <p className="font-bold text-lg dark:text-white">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(produto.preco)}
                  </p>

                  {isPlanoPago && (
                    <Button size="sm" className="h-8 w-8 p-0" style={{ backgroundColor: corPrimaria }}>
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
  )
}

