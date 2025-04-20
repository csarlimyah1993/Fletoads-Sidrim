"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Settings, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Produto } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface ProdutoCardProps {
  produto: Produto
  config: VitrineConfig
  onShare: (produto: Produto) => void
}

export function ProdutoCard({ produto, config, onShare }: ProdutoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  // Adicionar log para depuração
  console.log("Renderizando ProdutoCard:", produto)

  const handleViewDetails = () => {
    router.push(`/produtos/${produto._id}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/produtos/${produto._id}/editar`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const response = await fetch(`/api/produtos/${produto._id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          // Recarregar a página ou atualizar a lista
          window.location.reload()
        } else {
          alert("Erro ao excluir produto")
        }
      } catch (error) {
        console.error("Erro ao excluir produto:", error)
        alert("Erro ao excluir produto")
      }
    }
  }

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/produtos/${produto._id}/configuracoes`)
  }

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg",
          !produto.ativo && "opacity-75",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDetails}
      >
        <div className="relative aspect-square bg-muted">
          {produto.imagens && produto.imagens.length > 0 ? (
            <div className="w-full h-full relative">
              <Image
                src={produto.imagens[0] || "/placeholder.svg"}
                alt={produto.nome}
                fill
                className="object-cover transition-transform duration-500"
                style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">Sem imagem</span>
            </div>
          )}

          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {produto.destaque && (
              <Badge className="bg-amber-500 hover:bg-amber-600">
                <Tag className="h-3 w-3 mr-1" /> Destaque
              </Badge>
            )}

            {!produto.ativo && (
              <Badge variant="outline" className="bg-background/80">
                Inativo
              </Badge>
            )}
          </div>

          {/* Settings button - now properly positioned */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 bg-white/80 hover:bg-white"
            style={{ opacity: isHovered ? 1 : 0 }}
            onClick={handleSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium line-clamp-1">{produto.nome}</h3>

          {produto.descricaoCurta && (
            <p className="text-sm text-muted-foreground line-clamp-2">{produto.descricaoCurta}</p>
          )}

          <div className="flex justify-between items-center">
            <div>
              {produto.precoPromocional ? (
                <div className="flex flex-col">
                  <span className="text-sm line-through text-muted-foreground">R$ {produto.preco.toFixed(2)}</span>
                  <span className="font-bold text-red-600">R$ {produto.precoPromocional.toFixed(2)}</span>
                </div>
              ) : (
                <span className="font-bold">R$ {produto.preco.toFixed(2)}</span>
              )}
            </div>

            {produto.estoque !== undefined && (
              <span className="text-sm text-muted-foreground">Estoque: {produto.estoque}</span>
            )}
          </div>

          <div className="flex justify-between pt-2 gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>

            <Button variant="outline" size="sm" className="flex-1" onClick={handleViewDetails}>
              <Eye className="h-4 w-4 mr-1" /> Detalhes
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
