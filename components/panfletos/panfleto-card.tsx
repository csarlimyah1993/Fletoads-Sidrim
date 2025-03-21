"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, MousePointer, Edit, Trash2, Share2 } from "lucide-react"
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

interface PanfletoCardProps {
  panfleto: {
    _id: string
    title: string
    description: string
    images: string[]
    createdAt: string
    status: "draft" | "published"
    views: number
    clicks: number
  }
}

export function PanfletoCard({ panfleto }: PanfletoCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/panfletos/${panfleto._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir panfleto")
      }

      toast({
        title: "Panfleto excluído",
        description: "O panfleto foi excluído com sucesso.",
      })

      // Recarregar a página para atualizar a lista
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir panfleto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o panfleto. Tente novamente mais tarde.",
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
      description: "O link do panfleto foi copiado para a área de transferência.",
    })
  }

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full">
        <div className="relative h-48 bg-muted">
          {panfleto.images && panfleto.images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {panfleto.images.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div className="h-full w-full relative">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${panfleto.title} - Imagem ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {panfleto.images.length > 1 && (
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
          <Badge variant={panfleto.status === "published" ? "default" : "secondary"} className="absolute top-2 right-2">
            {panfleto.status === "published" ? "Publicado" : "Rascunho"}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{panfleto.title}</CardTitle>
          <CardDescription className="line-clamp-2">{panfleto.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{panfleto.views}</span>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              <span>{panfleto.clicks}</span>
            </div>
            <div>
              {formatDistanceToNow(new Date(panfleto.createdAt), {
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
            onClick={() => router.push(`/panfletos/editar/${panfleto._id}`)}
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
            <AlertDialogTitle>Excluir panfleto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este panfleto? Esta ação não pode ser desfeita.
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

