"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"

interface ProdutoCardProps {
  produto: {
    _id: string
    name: string
    description: string
    price: number
    images: string[]
    createdAt: string
    status: "active" | "inactive"
  }
}

export function ProdutoCard({ produto }: ProdutoCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/produtos/${produto._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir produto")
      }

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      })

      // Recarregar a página para atualizar a lista
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleShare = () => {
    // Implementação futura de compartilhamento
    toast({
      title: "Link copiado",
      description: "O link do produto foi copiado para a área de transferência.",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full">
        <div className="relative h-48 bg-muted">
          {produto.images && produto.images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {produto.images.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div className="h-full w-full relative">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${produto.name} - Imagem ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {produto.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <p className="text-muted-foreground">Sem imagens</p>
            </div>
          )}
          <Badge variant={produto.status === "active" ? "default" : "secondary"} className="absolute top-2 right-2">
            {produto.status === "active" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{produto.name}</CardTitle>
          <CardDescription className="line-clamp-2">{produto.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">{formatPrice(produto.price)}</div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(produto.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/produtos/editar/${produto._id}`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

