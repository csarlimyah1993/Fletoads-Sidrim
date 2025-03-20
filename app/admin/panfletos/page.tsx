"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

// Mock data for panfletos
const mockPanfletos = [
  {
    id: "1",
    titulo: "Promoção de Verão",
    descricao: "Grandes descontos em produtos de verão",
    usuario: "João Silva",
    dataCriacao: "2023-12-15T10:30:00Z",
    status: "publicado",
    visualizacoes: 245,
    cliques: 87,
    imagem: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    titulo: "Liquidação de Inverno",
    descricao: "Até 50% de desconto em roupas de inverno",
    usuario: "Maria Oliveira",
    dataCriacao: "2023-12-10T14:20:00Z",
    status: "publicado",
    visualizacoes: 189,
    cliques: 63,
    imagem: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    titulo: "Novos Produtos",
    descricao: "Confira os lançamentos da temporada",
    usuario: "Carlos Santos",
    dataCriacao: "2023-12-05T09:15:00Z",
    status: "rascunho",
    visualizacoes: 0,
    cliques: 0,
    imagem: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "4",
    titulo: "Black Friday",
    descricao: "Ofertas imperdíveis para a Black Friday",
    usuario: "Ana Pereira",
    dataCriacao: "2023-11-20T16:45:00Z",
    status: "publicado",
    visualizacoes: 532,
    cliques: 215,
    imagem: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "5",
    titulo: "Natal Especial",
    descricao: "Presentes e ofertas para o Natal",
    usuario: "Pedro Alves",
    dataCriacao: "2023-11-15T11:10:00Z",
    status: "publicado",
    visualizacoes: 321,
    cliques: 142,
    imagem: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "6",
    titulo: "Volta às Aulas",
    descricao: "Tudo o que você precisa para o novo ano letivo",
    usuario: "Fernanda Lima",
    dataCriacao: "2023-11-05T13:25:00Z",
    status: "rascunho",
    visualizacoes: 0,
    cliques: 0,
    imagem: "/placeholder.svg?height=200&width=300",
  },
]

export default function AdminPanfletosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [panfletos, setPanfletos] = useState<any[]>([])
  const [filteredPanfletos, setFilteredPanfletos] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [sortBy, setSortBy] = useState("recentes")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [panfletoToDelete, setPanfletoToDelete] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call to fetch panfletos
    const fetchPanfletos = async () => {
      try {
        setLoading(true)
        // In a real app, this would be an API call
        // const response = await fetch('/api/admin/panfletos')
        // const data = await response.json()

        // Using mock data for now
        setTimeout(() => {
          setPanfletos(mockPanfletos)
          setFilteredPanfletos(mockPanfletos)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching panfletos:", error)
        setLoading(false)
      }
    }

    fetchPanfletos()
  }, [])

  useEffect(() => {
    // Filter and sort panfletos based on search, status, and sort criteria
    let filtered = [...panfletos]

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.titulo.toLowerCase().includes(search.toLowerCase()) ||
          p.descricao.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "todos") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Apply sorting
    if (sortBy === "recentes") {
      filtered.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
    } else if (sortBy === "antigos") {
      filtered.sort((a, b) => new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime())
    } else if (sortBy === "visualizacoes") {
      filtered.sort((a, b) => b.visualizacoes - a.visualizacoes)
    } else if (sortBy === "cliques") {
      filtered.sort((a, b) => b.cliques - a.cliques)
    }

    setFilteredPanfletos(filtered)
  }, [panfletos, search, statusFilter, sortBy])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handleDeleteClick = (id: string) => {
    setPanfletoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (panfletoToDelete) {
      // In a real app, this would be an API call
      // await fetch(`/api/admin/panfletos/${panfletoToDelete}`, { method: 'DELETE' })

      // Update local state
      setPanfletos(panfletos.filter((p) => p.id !== panfletoToDelete))
      toast.success("Panfleto excluído com sucesso")
    }
    setDeleteDialogOpen(false)
    setPanfletoToDelete(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciamento de Panfletos</h1>
        <Button onClick={() => router.push("/admin/panfletos/novo")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Panfleto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar panfletos..." className="pl-8" value={search} onChange={handleSearchChange} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="publicado">Publicados</SelectItem>
              <SelectItem value="rascunho">Rascunhos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="antigos">Mais antigos</SelectItem>
              <SelectItem value="visualizacoes">Mais visualizados</SelectItem>
              <SelectItem value="cliques">Mais cliques</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="aspect-video w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPanfletos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum panfleto encontrado</h3>
          <p className="text-muted-foreground mt-2">Tente ajustar os filtros ou criar um novo panfleto.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/panfletos/novo")}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Panfleto
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPanfletos.map((panfleto) => (
            <Card key={panfleto.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={panfleto.imagem || "/placeholder.svg"}
                  alt={panfleto.titulo}
                  className="w-full aspect-video object-cover"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    panfleto.status === "publicado"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300"
                  }`}
                >
                  {panfleto.status === "publicado" ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{panfleto.titulo}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{panfleto.descricao}</p>

                <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                  <span>Por: {panfleto.usuario}</span>
                  <span>{formatDate(panfleto.dataCriacao)}</span>
                </div>

                {panfleto.status === "publicado" && (
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <span className="font-medium">{panfleto.visualizacoes}</span> visualizações
                    </div>
                    <div>
                      <span className="font-medium">{panfleto.cliques}</span> cliques
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/admin/panfletos/${panfleto.id}`)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Ações
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/panfletos/${panfleto.id}/editar`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDeleteClick(panfleto.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination - would be dynamic in a real app */}
      {!loading && filteredPanfletos.length > 0 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            1
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            2
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            3
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este panfleto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

