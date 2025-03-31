"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MoreHorizontal, Search, UserPlus, Filter, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface User {
  _id: string
  nome: string
  email: string
  cargo: string
  plano: string
  ativo: boolean
  createdAt: string
  updatedAt: string
  ultimoLogin?: string
}

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/usuarios?page=${page}&limit=${limit}&search=${searchTerm}`)

      if (!response.ok) {
        throw new Error(`Erro ao buscar usuários: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        setUsers(data.data.usuarios)
        setTotal(data.data.pagination.total)
        setFilteredUsers(data.data.usuarios)
      } else {
        throw new Error(data.message || "Erro ao buscar usuários")
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      setError((error as Error).message || "Não foi possível carregar a lista de usuários")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, limit, searchTerm])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch (error) {
      return "Data inválida"
    }
  }

  const getPlanoBadgeVariant = (plano: string) => {
    switch (plano?.toLowerCase()) {
      case "premium":
        return "success"
      case "basico":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset para a primeira página ao buscar
    fetchUsers()
  }

  const handleRefresh = () => {
    fetchUsers()
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>Gerencie todos os usuários da plataforma. Total: {total} usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center py-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuários..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="ghost" className="ml-2">
              Buscar
            </Button>
          </form>

          {isLoading && (
            <div className="flex justify-center items-center h-12 mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {error && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">{error}</div>}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {isLoading ? "Carregando..." : "Nenhum usuário encontrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.cargo === "admin" ? "destructive" : "outline"}>
                          {user.cargo === "admin" ? "Administrador" : "Editor"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanoBadgeVariant(user.plano)}>
                          {user.plano ? user.plano.charAt(0).toUpperCase() + user.plano.slice(1) : "Gratuito"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.ativo ? "success" : "destructive"}>
                          {user.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{user.ultimoLogin ? formatDate(user.ultimoLogin) : "Nunca"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar usuário</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Redefinir senha</DropdownMenuItem>
                            <DropdownMenuItem className={user.ativo ? "text-red-600" : "text-green-600"}>
                              {user.ativo ? "Desativar usuário" : "Ativar usuário"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {total > limit && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <div className="text-sm">
                Página {page} de {Math.ceil(total / limit)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => (prev * limit < total ? prev + 1 : prev))}
                disabled={page * limit >= total}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

