"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
  createdAt: string
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@example.com",
      role: "Admin",
      status: "active",
      createdAt: "2023-01-15",
    },
    {
      id: "2",
      name: "Maria Oliveira",
      email: "maria@example.com",
      role: "Usuário",
      status: "active",
      createdAt: "2023-02-20",
    },
    {
      id: "3",
      name: "Pedro Santos",
      email: "pedro@example.com",
      role: "Usuário",
      status: "inactive",
      createdAt: "2023-03-10",
    },
    {
      id: "4",
      name: "Ana Costa",
      email: "ana@example.com",
      role: "Usuário",
      status: "pending",
      createdAt: "2023-04-05",
    },
    {
      id: "5",
      name: "Carlos Ferreira",
      email: "carlos@example.com",
      role: "Usuário",
      status: "active",
      createdAt: "2023-05-12",
    },
  ])

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativo</Badge>
      case "inactive":
        return <Badge className="bg-gray-500">Inativo</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            className="h-9 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[20px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar usuário</DropdownMenuItem>
                        <DropdownMenuItem>Redefinir senha</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Excluir usuário</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
