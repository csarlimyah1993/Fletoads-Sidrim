"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Panfleto {
  _id: string
  titulo: string
  loja: string
  dataInicio: string
  dataFim: string
  status: string
  imagem?: string
  createdAt: string
}

export default function PanfletosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [panfletos, setPanfletos] = useState<Panfleto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPanfletos() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/panfletos")

        if (!response.ok) {
          throw new Error(`Erro ao buscar panfletos: ${response.status}`)
        }

        const data = await response.json()
        setPanfletos(data.panfletos || [])
      } catch (err) {
        console.error("Erro ao buscar panfletos:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar panfletos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPanfletos()
  }, [])

  const filteredPanfletos = panfletos.filter(
    (panfleto) =>
      panfleto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panfleto.loja.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciamento de Panfletos</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Panfleto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Panfletos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar panfletos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Panfleto</th>
                    <th className="text-left py-3 px-4 font-medium">Loja</th>
                    <th className="text-left py-3 px-4 font-medium">Período</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPanfletos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum panfleto encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredPanfletos.map((panfleto) => (
                      <tr key={panfleto._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {panfleto.imagem ? (
                              <img
                                src={panfleto.imagem || "/placeholder.svg"}
                                alt={panfleto.titulo}
                                className="w-16 h-20 rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-16 h-20 rounded-md bg-muted flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{panfleto.titulo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{panfleto.loja}</td>
                        <td className="py-3 px-4">
                          {formatarData(panfleto.dataInicio)} - {formatarData(panfleto.dataFim)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              panfleto.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {panfleto.status === "active" ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <Eye className="h-4 w-4" />
                                <span>Visualizar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <Edit className="h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
