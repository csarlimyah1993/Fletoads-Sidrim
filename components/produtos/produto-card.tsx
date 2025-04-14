"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Share2, ShoppingCart, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Produto } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface ProdutoCardProps {
  produto: Produto
  config: VitrineConfig
  onShare: (produto: Produto) => void
  onFavorite?: (produto: Produto) => void
  isFavorite?: boolean
  layout?: string
  animationProps?: any
}

export function ProdutoCard({
  produto,
  config,
  onShare,
  onFavorite,
  isFavorite = false,
  layout = "padrao",
  animationProps = {},
}: ProdutoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    if (produto._id) {
      // Navegar para a página do produto
      const vitrineId = window.location.pathname.split("/").pop()
      router.push(`/vitrines/${vitrineId}/produto/${produto._id}`)
    }
  }

  return (
    <motion.div {...animationProps}>
      <Card
        className={cn(
          "h-full flex flex-col overflow-hidden border transition-all duration-300",
          isHovered ? "shadow-lg transform translate-y-[-5px]" : "",
          config.tema === "escuro" ? "bg-gray-800 border-gray-700" : "bg-white",
          layout === "magazine" ? "flex-row" : "flex-col",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <div className={cn("relative overflow-hidden", layout === "magazine" ? "w-1/3" : "aspect-square w-full")}>
          {produto.imagens && produto.imagens.length > 0 ? (
            <Image
              src={produto.imagens[0] || "/placeholder.svg"}
              alt={produto.nome}
              fill
              className={cn("object-cover transition-transform duration-500", isHovered ? "scale-110" : "scale-100")}
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

          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(produto)
              }}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-all"
            >
              <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
            </button>
          )}

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
              >
                <Button className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg" size="sm">
                  Ver detalhes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className={cn("flex-1 flex flex-col p-4", layout === "magazine" ? "w-2/3" : "w-full")}>
          <h3 className="font-bold text-lg line-clamp-2">{produto.nome}</h3>

          {produto.descricaoCurta && (
            <p
              className={cn("text-sm mt-1 line-clamp-2", config.tema === "escuro" ? "text-gray-300" : "text-gray-500")}
            >
              {produto.descricaoCurta}
            </p>
          )}

          {config?.mostrarPrecos && (
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

          {config?.mostrarAvaliacao && (
            <div className="flex items-center mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4"
                    fill={star <= 4 ? "#FFD700" : "none"}
                    stroke={star <= 4 ? "#FFD700" : "#CBD5E1"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">(4.0)</span>
            </div>
          )}

          <div className="mt-auto pt-4 flex gap-2">
            <Button
              className="flex-1"
              style={{
                backgroundColor: config?.corPrimaria || "#3b82f6",
                color: config?.corTexto || "#ffffff",
              }}
              onClick={handleClick}
            >
              Ver detalhes
            </Button>

            {config?.mostrarCompartilhar && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onShare(produto)
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
