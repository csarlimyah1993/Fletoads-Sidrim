"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { usePlanFeatures } from "@/hooks/use-plan-features"

export function PanfletosContent() {
  const { data: session } = useSession()
  const { hasFeature } = usePlanFeatures()
  const [panfletos, setPanfletos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPanfletos() {
      try {
        setLoading(true)
        const response = await fetch("/api/panfletos")
        if (!response.ok) {
          throw new Error("Falha ao carregar panfletos")
        }
        const data = await response.json()
        setPanfletos(data.panfletos || [])
      } catch (err) {
        console.error("Erro ao buscar panfletos:", err)
        setError("Não foi possível carregar os panfletos. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchPanfletos()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Panfletos</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Criar Panfleto
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Panfletos</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Panfletos</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Criar Panfleto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar panfletos..." className="pl-8" />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filtrar
        </Button>
      </div>

      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
          <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {panfletos.length > 0 ? (
              panfletos.map((panfleto: any) => (
                <Card key={panfleto._id}>
                  <CardHeader>
                    <CardTitle>{panfleto.titulo || "Panfleto sem título"}</CardTitle>
                    <CardDescription>Criado em: {new Date(panfleto.createdAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[3/4] relative bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                      {panfleto.imagemUrl ? (
                        <img
                          src={panfleto.imagemUrl || "/placeholder.svg"}
                          alt={panfleto.titulo}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileText className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {panfleto.status || "Rascunho"}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" /> Visualizar
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Nenhum panfleto encontrado</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Comece criando seu primeiro panfleto.</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Criar Panfleto
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Conteúdo similar para as outras abas */}
        <TabsContent value="ativos" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full text-center py-12">
              <p>Nenhum panfleto ativo encontrado.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inativos" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full text-center py-12">
              <p>Nenhum panfleto inativo encontrado.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rascunhos" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full text-center py-12">
              <p>Nenhum rascunho encontrado.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

