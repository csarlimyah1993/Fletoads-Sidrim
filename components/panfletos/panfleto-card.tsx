"use client"

import Link from "next/link"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Eye, Calendar, Tag, ArrowUpRight, Edit, Trash2, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface PanfletoCardProps {
  panfleto: {
    _id: string
    titulo: string
    descricao: string
    imagem: string
    categoria: string
    status: string
    dataCriacao: string
    visualizacoes?: number
    ativo?: boolean
  }
  onDelete?: (id: string) => void
}

export function PanfletoCard({ panfleto, onDelete }: PanfletoCardProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Função para determinar a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "draft":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "inactive":
      case "archived":
        return "bg-red-100 text-red-800 border-red-300"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Tradução do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "draft":
        return "Rascunho"
      case "inactive":
        return "Inativo"
      case "archived":
        return "Arquivado"
      case "scheduled":
        return "Agendado"
      default:
        return status
    }
  }

  // Formatar data
  const formattedDate = panfleto.dataCriacao
    ? format(parseISO(panfleto.dataCriacao), "dd 'de' MMMM, yyyy", { locale: ptBR })
    : "Data não disponível"

  const handleDelete = () => {
    if (onDelete) {
      onDelete(panfleto._id)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/panfletos/${panfleto._id}`)
    toast({
      title: "Link copiado",
      description: "O link do panfleto foi copiado para a área de transferência.",
    })
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md group h-full flex flex-col">
      <div className="relative h-48 w-full overflow-hidden">
        {panfleto.imagem ? (
          <Image
            src={panfleto.imagem || "/placeholder.svg"}
            alt={panfleto.titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Sem imagem</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <Badge className={`absolute top-3 right-3 ${getStatusColor(panfleto.status)}`}>
          {getStatusText(panfleto.status)}
        </Badge>
      </div>

      <CardContent className="flex-grow flex flex-col p-4">
        <h3 className="text-lg font-semibold line-clamp-1 mb-1">{panfleto.titulo}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{panfleto.descricao}</p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>{panfleto.categoria}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span>{panfleto.visualizacoes || 0} visualizações</span>
            </div>

            <Link
              href={`/dashboard/panfletos/${panfleto._id}`}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver detalhes
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>

      <div className="px-4 pb-4 pt-0 flex gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => router.push(`/dashboard/panfletos/editar/${panfleto._id}`)}
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>

        <Button variant="outline" size="sm" className="flex-1" onClick={handleDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Excluir
        </Button>

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleShare}>
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  )
}
