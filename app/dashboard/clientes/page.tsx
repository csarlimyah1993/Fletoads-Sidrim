"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Building2, Plus, Search, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Cliente {
  _id: string
  nome: string
  empresa: string
  email: string
  telefone: string
  status: string
  ultimoContato: string
}

export default function ClientesPage() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/clientes")

        if (!response.ok) {
          throw new Error("Erro ao buscar clientes")
        }

        const data = await response.json()

        if (Array.isArray(data.clientes)) {
          setClientes(data.clientes)
        } else {
          setClientes([])
          console.error("Dados de clientes não são um array:", data)
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os clientes. Tente novamente mais tarde.",
          variant: "destructive",
        })
        setClientes([])
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [toast])

  // Filtrar clientes com base nos critérios de busca
  const clientesFiltrados = clientes.filter((cliente) => {
    const matchBusca = busca
      ? cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.empresa.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.email.toLowerCase().includes(busca.toLowerCase())
      : true
    const matchStatus = status ? cliente.status === status : true

    return matchBusca && matchStatus
  })

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
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
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Button onClick={() => router.push("/dashboard/clientes/novo")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
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
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="prospecto">Prospecto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
          <TabsTrigger value="prospectos">Prospectos</TabsTrigger>
        </TabsList>
        <TabsContent value="todos" className="space-y-4">
          {clientesFiltrados.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clientesFiltrados.map((cliente) => (
                <Link href={`/dashboard/clientes/${cliente._id}`} key={cliente._id}>
                  <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${
                            cliente.status === "ativo"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : cliente.status === "inativo"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          }`}
                        >
                          {cliente.status === "ativo"
                            ? "Ativo"
                            : cliente.status === "inativo"
                              ? "Inativo"
                              : "Prospecto"}
                        </div>
                      </div>
                      <CardDescription>{cliente.empresa}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{cliente.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{cliente.telefone}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="text-xs text-muted-foreground">
                        Último contato: {new Date(cliente.ultimoContato).toLocaleDateString()}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
              <Button onClick={() => router.push("/dashboard/clientes/novo")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Novo Cliente
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="ativos" className="space-y-4">
          {clientesFiltrados.filter((c) => c.status === "ativo").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clientesFiltrados
                .filter((c) => c.status === "ativo")
                .map((cliente) => (
                  <Link href={`/dashboard/clientes/${cliente._id}`} key={cliente._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                        <CardDescription>{cliente.empresa}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{cliente.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{cliente.telefone}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="text-xs text-muted-foreground">
                          Último contato: {new Date(cliente.ultimoContato).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum cliente ativo encontrado.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="inativos" className="space-y-4">
          {clientesFiltrados.filter((c) => c.status === "inativo").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clientesFiltrados
                .filter((c) => c.status === "inativo")
                .map((cliente) => (
                  <Link href={`/dashboard/clientes/${cliente._id}`} key={cliente._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                        <CardDescription>{cliente.empresa}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{cliente.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{cliente.telefone}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="text-xs text-muted-foreground">
                          Último contato: {new Date(cliente.ultimoContato).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum cliente inativo encontrado.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="prospectos" className="space-y-4">
          {clientesFiltrados.filter((c) => c.status === "prospecto").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clientesFiltrados
                .filter((c) => c.status === "prospecto")
                .map((cliente) => (
                  <Link href={`/dashboard/clientes/${cliente._id}`} key={cliente._id}>
                    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                        <CardDescription>{cliente.empresa}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{cliente.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{cliente.telefone}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="text-xs text-muted-foreground">
                          Último contato: {new Date(cliente.ultimoContato).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum cliente prospecto encontrado.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
