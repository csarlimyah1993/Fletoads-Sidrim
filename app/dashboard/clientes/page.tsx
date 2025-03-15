"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Building2, Plus, Search, User } from "lucide-react"
import Link from "next/link"

export default function ClientesPage() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState("")

  // Dados de exemplo para clientes
  const clientes = [
    {
      id: "1",
      nome: "João Silva",
      empresa: "Empresa ABC",
      email: "joao.silva@email.com",
      telefone: "(92) 98765-4321",
      status: "ativo",
      ultimoContato: "2023-12-01",
    },
    {
      id: "2",
      nome: "Maria Oliveira",
      empresa: "Comércio XYZ",
      email: "maria.oliveira@email.com",
      telefone: "(92) 98765-1234",
      status: "ativo",
      ultimoContato: "2023-11-15",
    },
    {
      id: "3",
      nome: "Pedro Santos",
      empresa: "Indústria 123",
      email: "pedro.santos@email.com",
      telefone: "(92) 99876-5432",
      status: "inativo",
      ultimoContato: "2023-10-10",
    },
    {
      id: "4",
      nome: "Ana Souza",
      empresa: "Serviços Rápidos",
      email: "ana.souza@email.com",
      telefone: "(92) 98123-4567",
      status: "prospecto",
      ultimoContato: "2023-12-05",
    },
    {
      id: "5",
      nome: "Carlos Ferreira",
      empresa: "Consultoria Eficaz",
      email: "carlos.ferreira@email.com",
      telefone: "(92) 99123-8765",
      status: "ativo",
      ultimoContato: "2023-11-20",
    },
  ]

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
              <SelectItem value="all">Todos</SelectItem>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientesFiltrados.map((cliente) => (
              <Link href={`/dashboard/clientes/${cliente.id}`} key={cliente.id}>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                      <div
                        className={`px-2 py-1 rounded-full text-xs ${
                          cliente.status === "ativo"
                            ? "bg-green-100 text-green-800"
                            : cliente.status === "inativo"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {cliente.status === "ativo" ? "Ativo" : cliente.status === "inativo" ? "Inativo" : "Prospecto"}
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
        </TabsContent>
        <TabsContent value="ativos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientesFiltrados
              .filter((c) => c.status === "ativo")
              .map((cliente) => (
                <Link href={`/dashboard/clientes/${cliente.id}`} key={cliente.id}>
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
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
        </TabsContent>
        <TabsContent value="inativos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientesFiltrados
              .filter((c) => c.status === "inativo")
              .map((cliente) => (
                <Link href={`/dashboard/clientes/${cliente.id}`} key={cliente.id}>
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
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
        </TabsContent>
        <TabsContent value="prospectos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientesFiltrados
              .filter((c) => c.status === "prospecto")
              .map((cliente) => (
                <Link href={`/dashboard/clientes/${cliente.id}`} key={cliente.id}>
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

