"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Search, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Panfleto {
  _id: string
  title: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

export function PanfletosList() {
  const [panfletos, setPanfletos] = useState<Panfleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
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
            title: "Promoção de Verão",
            description: "Grandes descontos em produtos de verão",
            status: "ativo",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: "2",
            title: "Liquidação de Inverno",
            description: "Até 50% de desconto em produtos de inverno",
            status: "inativo",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
          panfleto.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          panfleto.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este panfleto?")) {
      try {
        const response = await fetch(`/api/panfletos/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erro ao excluir panfleto")
        }

        setPanfletos(panfletos.filter((panfleto) => panfleto._id !== id))

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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar panfletos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/dashboard/panfletos/novo">Novo Panfleto</Link>
        </Button>
      </div>

      {filteredPanfletos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhum panfleto encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPanfletos.map((panfleto) => (
            <Card key={panfleto._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{panfleto.title}</CardTitle>
                  <Badge variant={panfleto.status === "ativo" ? "default" : "outline"}>
                    {panfleto.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{panfleto.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Criado em: {new Date(panfleto.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/panfletos/${panfleto._id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/panfletos/${panfleto._id}/editar`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(panfleto._id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
