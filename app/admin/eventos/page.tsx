"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, Users, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Evento {
  _id: string
  nome: string
  descricao?: string
  imagem?: string
  dataInicio: string
  dataFim: string
  ativo: boolean
  lojasParticipantes: string[]
  dataCriacao: string
  criadoPor: string
  visitantesUnicos: number
  totalVisitantes: number
}

export default function EventosPage() {
  const router = useRouter()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchEventos()
  }, [])

  const fetchEventos = async () => {
    try {
      setLoading(true)
      // Use absolute URL to avoid URL parsing issues
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos`)

      if (!response.ok) {
        throw new Error(`Erro ao buscar eventos: ${response.status}`)
      }

      const data = await response.json()
      setEventos(data.eventos || [])
    } catch (error) {
      console.error("Erro ao buscar eventos:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAtivo = async (id: string, ativoAtual: boolean) => {
    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ativo: !ativoAtual,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar status do evento")
      }

      toast.success(`Evento ${!ativoAtual ? "ativado" : "desativado"} com sucesso`)
      fetchEventos() // Refresh the list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar evento")
    }
  }

  const handleDeleteEvento = async (id: string) => {
    try {
      setDeletingId(id)
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir evento")
      }

      toast.success("Evento excluído com sucesso")
      fetchEventos() // Refresh the list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir evento")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Erro ao carregar eventos</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button onClick={fetchEventos} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Eventos</h1>
        <Button asChild>
          <Link href="/admin/eventos/criar">
            <Plus className="h-4 w-4 mr-2" />
            Criar Evento
          </Link>
        </Button>
      </div>

      {eventos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground mb-6">Crie seu primeiro evento para começar</p>
            <Button asChild>
              <Link href="/admin/eventos/criar">
                <Plus className="h-4 w-4 mr-2" />
                Criar Evento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Eventos</CardTitle>
              <CardDescription>
                Gerencie os eventos da plataforma. Eventos ativos são exibidos para os usuários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Visualizações</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventos.map((evento) => (
                    <TableRow key={evento._id}>
                      <TableCell className="font-medium">{evento.nome}</TableCell>
                      <TableCell>
                        {format(new Date(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })} a{" "}
                        {format(new Date(evento.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {evento.ativo ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span>{evento.lojasParticipantes?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{evento.visitantesUnicos || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleAtivo(evento._id, evento.ativo)}
                            title={evento.ativo ? "Desativar evento" : "Ativar evento"}
                          >
                            {evento.ativo ? (
                              <ToggleRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/eventos/${evento._id}`)}
                            title="Editar evento"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Excluir evento">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o evento "{evento.nome}"? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEvento(evento._id)}
                                  className="bg-red-500 hover:bg-red-600"
                                  disabled={deletingId === evento._id}
                                >
                                  {deletingId === evento._id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Excluindo...
                                    </>
                                  ) : (
                                    "Excluir"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
