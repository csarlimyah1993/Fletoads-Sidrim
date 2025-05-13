"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface Cliente {
  _id: string
  nome: string
  email: string
  telefone: string
  documento: string
  status: string
  totalGasto: number
  numeroPedidos: number
  dataCadastro: string
  cidade?: string
  estado?: string
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchClientes() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/dashboard/clientes")

        if (!response.ok) {
          throw new Error(`Erro ao buscar clientes: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dados de clientes recebidos:", data)
        setClientes(data.clientes || [])
      } catch (err) {
        console.error("Erro ao buscar clientes:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar clientes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientes()
  }, [])

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Formatar valor em reais
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Função para lidar com a exclusão de cliente
  const handleDeleteCliente = async (clienteId: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const response = await fetch(`/api/clientes/${clienteId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erro ao excluir cliente")
        }

        // Atualizar a lista de clientes após a exclusão
        setClientes(clientes.filter((cliente) => cliente._id !== clienteId))

        // Mostrar mensagem de sucesso
        alert("Cliente excluído com sucesso")
      } catch (error) {
        console.error("Erro ao excluir cliente:", error)
        alert("Erro ao excluir cliente")
      }
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Meus Clientes</h1>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() => router.push("/dashboard/clientes/novo")}
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
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
            <>
              {/* Versão para desktop e tablet */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Nome</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Telefone</th>
                      <th className="text-left py-3 px-4 font-medium">Localização</th>
                      <th className="text-left py-3 px-4 font-medium">Total Gasto</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum cliente encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredClientes.map((cliente) => (
                        <tr key={cliente._id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{cliente.nome}</td>
                          <td className="py-3 px-4">{cliente.email}</td>
                          <td className="py-3 px-4">{cliente.telefone}</td>
                          <td className="py-3 px-4">
                            {cliente.cidade && cliente.estado ? `${cliente.cidade}, ${cliente.estado}` : "—"}
                          </td>
                          <td className="py-3 px-4">{formatarValor(cliente.totalGasto || 0)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                cliente.status === "ativo"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : cliente.status === "prospecto"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                              }`}
                            >
                              {cliente.status === "ativo"
                                ? "Ativo"
                                : cliente.status === "prospecto"
                                  ? "Prospecto"
                                  : cliente.status || "Indefinido"}
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
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => router.push(`/dashboard/clientes/${cliente._id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>Ver detalhes</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => router.push(`/dashboard/clientes/${cliente._id}/editar`)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer text-destructive"
                                  onClick={() => handleDeleteCliente(cliente._id)}
                                >
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

              {/* Versão para dispositivos móveis */}
              <div className="md:hidden space-y-4">
                {filteredClientes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</div>
                ) : (
                  filteredClientes.map((cliente) => (
                    <div key={cliente._id} className="border rounded-lg p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{cliente.nome}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mt-1 -mr-2">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => router.push(`/dashboard/clientes/${cliente._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver detalhes</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => router.push(`/dashboard/clientes/${cliente._id}/editar`)}
                            >
                              <Edit className="h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer text-destructive"
                              onClick={() => handleDeleteCliente(cliente._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Email:</p>
                          <p className="truncate">{cliente.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Telefone:</p>
                          <p>{cliente.telefone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Localização:</p>
                          <p>{cliente.cidade && cliente.estado ? `${cliente.cidade}, ${cliente.estado}` : "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Gasto:</p>
                          <p>{formatarValor(cliente.totalGasto || 0)}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-muted-foreground mb-1">Status:</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              cliente.status === "ativo"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : cliente.status === "prospecto"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                            }`}
                          >
                            {cliente.status === "ativo"
                              ? "Ativo"
                              : cliente.status === "prospecto"
                                ? "Prospecto"
                                : cliente.status || "Indefinido"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
