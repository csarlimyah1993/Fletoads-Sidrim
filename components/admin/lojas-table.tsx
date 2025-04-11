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
import { MoreHorizontal, Search, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Loja {
  id: string
  nome: string
  proprietario: string
  plano: string
  status: "active" | "inactive" | "pending"
  createdAt: string
}

export function LojasTable() {
  const [lojas, setLojas] = useState<Loja[]>([
    {
      id: "1",
      nome: "Supermercado Bom Preço",
      proprietario: "João Silva",
      plano: "Premium",
      status: "active",
      createdAt: "2023-01-15",
    },
    {
      id: "2",
      nome: "Farmácia Saúde",
      proprietario: "Maria Oliveira",
      plano: "Básico",
      status: "active",
      createdAt: "2023-02-20",
    },
    {
      id: "3",
      nome: "Padaria Delícia",
      proprietario: "Pedro Santos",
      plano: "Start",
      status: "inactive",
      createdAt: "2023-03-10",
    },
    {
      id: "4",
      nome: "Açougue Boi Feliz",
      proprietario: "Ana Costa",
      plano: "Completo",
      status: "pending",
      createdAt: "2023-04-05",
    },
    {
      id: "5",
      nome: "Loja de Roupas Fashion",
      proprietario: "Carlos Ferreira",
      plano: "Premium",
      status: "active",
      createdAt: "2023-05-12",
    },
  ])

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLojas = lojas.filter(
    (loja) =>
      loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loja.proprietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loja.plano.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativa</Badge>
      case "inactive":
        return <Badge className="bg-gray-500">Inativa</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  const getPlanoBadge = (plano: string) => {
    switch (plano) {
      case "Premium":
        return <Badge className="bg-purple-500">Premium</Badge>
      case "Completo":
        return <Badge className="bg-blue-500">Completo</Badge>
      case "Básico":
        return <Badge className="bg-green-500">Básico</Badge>
      case "Start":
        return <Badge className="bg-yellow-500">Start</Badge>
      case "Gratuito":
        return <Badge className="bg-gray-500">Gratuito</Badge>
      default:
        return <Badge>{plano}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lojas..."
            className="h-9 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm">
          <Store className="mr-2 h-4 w-4" />
          Adicionar Loja
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Plano</TableHead>
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
                    <Skeleton className="h-6 w-[150px]" />
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
            ) : filteredLojas.length > 0 ? (
              filteredLojas.map((loja) => (
                <TableRow key={loja.id}>
                  <TableCell>{loja.nome}</TableCell>
                  <TableCell>{loja.proprietario}</TableCell>
                  <TableCell>{getPlanoBadge(loja.plano)}</TableCell>
                  <TableCell>{getStatusBadge(loja.status)}</TableCell>
                  <TableCell>{loja.createdAt}</TableCell>
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
                        <DropdownMenuItem>Editar loja</DropdownMenuItem>
                        <DropdownMenuItem>Ver vitrine</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Desativar loja</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhuma loja encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
