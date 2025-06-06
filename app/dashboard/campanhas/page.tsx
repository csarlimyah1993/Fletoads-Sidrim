"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Calendar, Plus, Search, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface Campanha {
  _id: string
  nome: string
  descricao: string
  dataInicio: string
  dataFim: string
  status: string
  orcamento: number
  progresso: number
  responsavel: string
}

export default function CampanhasPage() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState("")
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCampanhas = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/campanhas")

        if (!response.ok) {
          throw new Error("Erro ao buscar campanhas")
        }

        const data = await response.json()

        if (Array.isArray(data.campanhas)) {
          setCampanhas(data.campanhas)
        } else {
          setCampanhas([])
          console.error("Dados de campanhas não são um array:", data)
        }
      } catch (error) {
        console.error("Erro ao buscar campanhas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as campanhas. Tente novamente mais tarde.",
          variant: "destructive",
        })
        setCampanhas([])
      } finally {
        setLoading(false)
      }
    }

    fetchCampanhas()
  }, [toast])

  // Filtrar campanhas com base nos critérios de busca
  const campanhasFiltradas = campanhas.filter((campanha) => {
    const matchBusca = busca
      ? campanha.nome.toLowerCase().includes(busca.toLowerCase()) ||
        campanha.descricao.toLowerCase().includes(busca.toLowerCase())
      : true
    const matchStatus = status ? campanha.status === status : true

    return matchBusca && matchStatus
  })

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Campanhas</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Campanhas</h2>
        <Button onClick={() => router.push("/dashboard/campanhas/nova")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanhas..."
              className="pl-8"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="planejada">Planejada</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="planejadas">Planejadas</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
        </TabsList>
        <TabsContent value="todas" className="space-y-4">
          {campanhasFiltradas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campanhasFiltradas.map((campanha) => (
                <Link href={`/dashboard/campanhas/${campanha._id}`} key={campanha._id}>
                  <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{campanha.nome}</CardTitle>
                        <Badge
                          className={
                            campanha.status === "em_andamento"
                              ? "bg-blue-500"
                              : campanha.status === "planejada"
                                ? "bg-yellow-500"
                                : campanha.status === "concluida"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                          }
                        >
                          {campanha.status === "em_andamento"
                            ? "Em Andamento"
                            : campanha.status === "planejada"
                              ? "Planejada"
                              : campanha.status === "concluida"
                                ? "Concluída"
                                : "Cancelada"}
                        </Badge>
                      </div>
                      <CardDescription>{campanha.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(campanha.dataInicio).toLocaleDateString()} -{" "}
                              {new Date(campanha.dataFim).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{campanha.progresso}%</span>
                          </div>
                          <Progress value={campanha.progresso} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{campanha.responsavel}</span>
                      </div>
                      <div className="text-sm font-medium">R$ {campanha.orcamento.toLocaleString()}</div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma campanha encontrada.</p>
              <Button onClick={() => router.push("/dashboard/campanhas/nova")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Nova Campanha
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="em_andamento" className="space-y-4">
          {campanhasFiltradas.filter((c) => c.status === "em_andamento").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campanhasFiltradas
                .filter((c) => c.status === "em_andamento")
                .map((campanha) => (
                  <Link href={`/dashboard/campanhas/${campanha._id}`} key={campanha._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{campanha.nome}</CardTitle>
                        <CardDescription>{campanha.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(campanha.dataInicio).toLocaleDateString()} -{" "}
                                {new Date(campanha.dataFim).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progresso</span>
                              <span>{campanha.progresso}%</span>
                            </div>
                            <Progress value={campanha.progresso} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{campanha.responsavel}</span>
                        </div>
                        <div className="text-sm font-medium">R$ {campanha.orcamento.toLocaleString()}</div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma campanha em andamento encontrada.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="planejadas" className="space-y-4">
          {campanhasFiltradas.filter((c) => c.status === "planejada").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campanhasFiltradas
                .filter((c) => c.status === "planejada")
                .map((campanha) => (
                  <Link href={`/dashboard/campanhas/${campanha._id}`} key={campanha._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{campanha.nome}</CardTitle>
                        <CardDescription>{campanha.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(campanha.dataInicio).toLocaleDateString()} -{" "}
                                {new Date(campanha.dataFim).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{campanha.responsavel}</span>
                        </div>
                        <div className="text-sm font-medium">R$ {campanha.orcamento.toLocaleString()}</div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma campanha planejada encontrada.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="concluidas" className="space-y-4">
          {campanhasFiltradas.filter((c) => c.status === "concluida").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campanhasFiltradas
                .filter((c) => c.status === "concluida")
                .map((campanha) => (
                  <Link href={`/dashboard/campanhas/${campanha._id}`} key={campanha._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{campanha.nome}</CardTitle>
                        <CardDescription>{campanha.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(campanha.dataInicio).toLocaleDateString()} -{" "}
                                {new Date(campanha.dataFim).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progresso</span>
                              <span>{campanha.progresso}%</span>
                            </div>
                            <Progress value={campanha.progresso} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{campanha.responsavel}</span>
                        </div>
                        <div className="text-sm font-medium">R$ {campanha.orcamento.toLocaleString()}</div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma campanha concluída encontrada.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
