"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Edit, Trash2, Eye, UserPlus, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"

interface Cliente {
  _id: string
  nome: string
  email: string
  telefone: string
  dataCadastro: string
  vip: boolean
  totalGasto: number
  numeroPedidos: number
}

export function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/clientes?search=${searchTerm}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar clientes")
      }
      const data = await response.json()
      setClientes(data.clientes)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchClientes()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) {
      return
    }

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir cliente")
      }

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso",
      })

      // Atualizar lista
      fetchClientes()
    } catch (error) {
      console.error("Erro ao excluir cliente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (e) {
      return "Data inválida"
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar clientes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        <Link href="/dashboard/clientes/novo">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg font-medium mb-2">Nenhum cliente encontrado</p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm ? "Tente ajustar sua busca ou limpar os filtros" : "Comece adicionando seu primeiro cliente"}
          </p>
          <Link href="/dashboard/clientes/novo">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Gasto</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente._id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {cliente.email && <span className="text-sm">{cliente.email}</span>}
                      {cliente.telefone && <span className="text-sm text-muted-foreground">{cliente.telefone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(cliente.dataCadastro)}</TableCell>
                  <TableCell>
                    {cliente.vip ? (
                      <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                        VIP
                      </Badge>
                    ) : (
                      <Badge variant="outline">Regular</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(cliente.totalGasto)}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/clientes/${cliente._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/clientes/${cliente._id}/editar`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(cliente._id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
