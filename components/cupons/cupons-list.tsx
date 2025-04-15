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
import { Search, MoreHorizontal, Edit, Trash2, Copy, Plus, Loader2, Percent, DollarSign, Truck } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Cupom {
  _id: string
  codigo: string
  tipo: "percentual" | "valor_fixo" | "frete_gratis"
  valor: number
  valorMinimo?: number
  dataInicio: string
  dataExpiracao: string
  limitePorUsuario?: number
  limiteUsos?: number
  usos: number
  ativo: boolean
  descricao?: string
}

export function CuponsList() {
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const router = useRouter()

  useEffect(() => {
    fetchCupons()
  }, [statusFilter])

  const fetchCupons = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cupons?search=${searchTerm}&status=${statusFilter}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar cupons")
      }
      const data = await response.json()
      setCupons(data.cupons)
    } catch (error) {
      console.error("Erro ao buscar cupons:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de cupons",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCupons()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) {
      return
    }

    try {
      const response = await fetch(`/api/cupons/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir cupom")
      }

      toast({
        title: "Cupom excluído",
        description: "O cupom foi excluído com sucesso",
      })

      // Atualizar lista
      fetchCupons()
    } catch (error) {
      console.error("Erro ao excluir cupom:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cupom",
        variant: "destructive",
      })
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Código copiado",
      description: "O código do cupom foi copiado para a área de transferência",
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (e) {
      return "Data inválida"
    }
  }

  const formatDiscount = (tipo: string, valor: number) => {
    if (tipo === "percentual") {
      return `${valor}%`
    } else if (tipo === "valor_fixo") {
      return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    } else if (tipo === "frete_gratis") {
      return "Frete Grátis"
    }
    return valor
  }

  const isExpired = (dataExpiracao: string) => {
    try {
      const expDate = new Date(dataExpiracao)
      return expDate < new Date()
    } catch (e) {
      return false
    }
  }

  const getDiscountIcon = (tipo: string) => {
    switch (tipo) {
      case "percentual":
        return <Percent className="h-4 w-4 mr-1" />
      case "valor_fixo":
        return <DollarSign className="h-4 w-4 mr-1" />
      case "frete_gratis":
        return <Truck className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full sm:max-w-md">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cupons..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/dashboard/cupons/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cupom
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : cupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg font-medium mb-2">Nenhum cupom encontrado</p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "todos"
              ? "Tente ajustar sua busca ou filtros"
              : "Comece adicionando seu primeiro cupom de desconto"}
          </p>
          <Link href="/dashboard/cupons/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Cupom
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cupons.map((cupom) => (
                <TableRow key={cupom._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="uppercase">{cupom.codigo}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyCode(cupom.codigo)}
                        title="Copiar código"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getDiscountIcon(cupom.tipo)}
                      <span>{formatDiscount(cupom.tipo, cupom.valor)}</span>
                    </div>
                    {cupom.valorMinimo && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Mínimo: {cupom.valorMinimo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{formatDate(cupom.dataInicio)} a</div>
                      <div>{formatDate(cupom.dataExpiracao)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{cupom.usos || 0} usos</span>
                      {cupom.limiteUsos && (
                        <span className="text-xs text-muted-foreground">Limite: {cupom.limiteUsos}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {!cupom.ativo ? (
                      <Badge variant="outline" className="bg-gray-100">
                        Inativo
                      </Badge>
                    ) : isExpired(cupom.dataExpiracao) ? (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Expirado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Ativo
                      </Badge>
                    )}
                  </TableCell>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/cupons/${cupom._id}/editar`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyCode(cupom.codigo)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar código
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(cupom._id)}>
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
