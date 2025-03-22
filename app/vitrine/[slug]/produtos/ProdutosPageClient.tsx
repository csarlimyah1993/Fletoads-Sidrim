"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import type { Loja } from "@/types/loja"
import { VitrineFooter } from "@/components/vitrine/vitrine-footer"
import { VitrineHeader } from "@/components/vitrine/vitrine-header"
import { useSession } from "next-auth/react"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"

interface ProdutosPageClientProps {
  loja: Loja
}

export default function ProdutosPageClient({ loja }: ProdutosPageClientProps) {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Garantir que ativo seja um booleano
  const isAtivo = loja.ativo === true

  if (!loja || !isAtivo) {
    notFound()
  }

  // Verificar se o usuário atual é o dono da loja
  let isOwner = false
  if (session?.user?.id) {
    const userId = session.user.id
    isOwner =
      (loja.usuarioId && (loja.usuarioId === userId || loja.usuarioId.toString() === userId)) ||
      (loja.userId && (loja.userId === userId || loja.userId.toString() === userId))
  }

  // Definir cores com base no plano
  const corPrimaria = loja.cores?.primaria || "#4f46e5"
  const isPlanoPago = loja.plano?.id !== "gratis"

  if (!mounted) {
    return null // Evitar renderização no servidor
  }

  return (
    <div className="flex flex-col min-h-screen">
      <VitrineHeader loja={loja} isOwner={isOwner} />

      <main className="flex-1 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">Todos os Produtos</h1>

          {loja.produtos && loja.produtos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {loja.produtos.map((produto) => (
                <div
                  key={produto._id.toString()}
                  className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm"
                >
                  <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                    {produto.imagens && produto.imagens.length > 0 ? (
                      <img
                        src={produto.imagens[0] || "/placeholder.svg"}
                        alt={produto.nome}
                        className="object-cover w-full h-full"
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
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium mb-1 dark:text-white">{produto.nome}</h3>

                    {produto.categoria && (
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
                        <Button size="sm" className="h-8 w-8 p-0" style={{ backgroundColor: corPrimaria }}>
                          <ShoppingBag className="h-4 w-4" />
                          <span className="sr-only">Adicionar ao carrinho</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum produto disponível no momento.</p>
              <Button onClick={() => window.history.back()} style={{ backgroundColor: corPrimaria }}>
                Voltar
              </Button>
            </div>
          )}
        </div>
      </main>

      <VitrineFooter loja={loja} />
    </div>
  )
}

