"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { PanfletoCard } from "@/components/panfletos/panfleto-card"
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

interface Panfleto {
  _id: string
  titulo: string
  descricao: string
  imagem: string
  categoria: string
  status: string
  dataCriacao: string
  dataAtualizacao: string
  visualizacoes?: number
  tipo?: string
  tags?: string[]
  preco?: number
  precoPromocional?: number
  dataInicio?: string
  dataFim?: string
  ativo?: boolean
  destaque?: boolean
  botaoAcao?: string
  botaoLink?: string
  codigo?: string
}

export function PanfletosList() {
  const [panfletos, setPanfletos] = useState<Panfleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [panfletoToDelete, setPanfletoToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPanfletos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/panfletos")

        if (!response.ok) {
          throw new Error(`Erro ao buscar panfletos: ${response.status}`)
        }

        const data = await response.json()

        // Verificar se data é um array ou se tem uma propriedade que é um array
        if (Array.isArray(data)) {
          setPanfletos(data)
        } else if (data.panfletos && Array.isArray(data.panfletos)) {
          setPanfletos(data.panfletos)
        } else {
          // Se não for um array, criar um array vazio
          console.warn("Dados de panfletos não são um array:", data)
          setPanfletos([])
        }

        setError(null)
      } catch (err) {
        console.error("Erro ao buscar panfletos:", err)
        setError("Não foi possível carregar os panfletos. Por favor, tente novamente mais tarde.")

        // Usar dados de exemplo em caso de erro
        setPanfletos([
          {
            _id: "1",
            titulo: "Promoção de Verão",
            descricao: "Grandes descontos em produtos de verão",
            imagem: "/vibrant-summer-sale.png",
            categoria: "Promoções",
            status: "active",
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString(),
            visualizacoes: 120,
            tipo: "ativo",
            tags: ["verão", "promoção", "desconto"],
            preco: 99.9,
            precoPromocional: 79.9,
          },
          {
            _id: "2",
            titulo: "Liquidação de Inverno",
            descricao: "Até 50% de desconto em produtos de inverno",
            imagem: "/winter-sale-shopping.png",
            categoria: "Liquidação",
            status: "inactive",
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString(),
            visualizacoes: 85,
            tipo: "inativo",
            tags: ["inverno", "liquidação", "desconto"],
            preco: 149.9,
            precoPromocional: 74.95,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPanfletos()
  }, [toast])

  const filteredPanfletos = Array.isArray(panfletos)
    ? panfletos.filter(
        (panfleto) =>
          panfleto.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          panfleto.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          panfleto.categoria?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (panfleto.tags && panfleto.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
      )
    : []

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/panfletos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir panfleto")
      }

      setPanfletos(panfletos.filter((panfleto) => panfleto._id !== id))
      setPanfletoToDelete(null)

      toast({
        title: "Panfleto excluído",
        description: "O panfleto foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir panfleto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o panfleto.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
        <div>
          <h3 className="font-medium">Erro</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar panfletos por título, descrição, categoria ou tags..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/dashboard/panfletos/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Panfleto
          </Link>
        </Button>
      </div>

      {filteredPanfletos.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-lg border border-muted">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-1">Nenhum panfleto encontrado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? `Não encontramos panfletos correspondentes à sua busca "${searchQuery}".`
              : "Você ainda não tem panfletos cadastrados."}
          </p>
          {searchQuery ? (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Limpar busca
            </Button>
          ) : (
            <Button className="mt-4" asChild>
              <Link href="/dashboard/panfletos/novo">
                <Plus className="h-4 w-4 mr-2" />
                Criar seu primeiro panfleto
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPanfletos.map((panfleto) => (
            <PanfletoCard key={panfleto._id} panfleto={panfleto} onDelete={(id: string) => setPanfletoToDelete(id)} />
          ))}
        </div>
      )}

      <AlertDialog open={!!panfletoToDelete} onOpenChange={(open) => !open && setPanfletoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir panfleto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este panfleto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => panfletoToDelete && handleDelete(panfletoToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
