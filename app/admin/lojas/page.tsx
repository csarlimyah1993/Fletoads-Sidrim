"use client"

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
import { Loader2, MoreHorizontal, Search, Filter, RefreshCw, Store } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Loja {
  id: string
  nome: string
  proprietario: string
  email: string
  telefone: string
  categoria: string
  ativa: boolean
  dataCriacao: string
  produtos: number
}

export default function LojasPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lojas, setLojas] = useState<Loja[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLojas, setFilteredLojas] = useState<Loja[]>([])

  useEffect(() => {
    const fetchLojas = async () => {
      try {
        setIsLoading(true)
        // Simular carregamento de dados
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Aqui você faria uma chamada real para a API
        // const response = await fetch("/api/admin/lojas")
        // const data = await response.json()

        // Dados simulados para demonstração
        const mockLojas: Loja[] = [
          {
            id: "1",
            nome: "Supermercado Silva",
            proprietario: "João Silva",
            email: "contato@supermercadosilva.com",
            telefone: "(11) 98765-4321",
            categoria: "Supermercado",
            ativa: true,
            dataCriacao: "2023-01-15T10:30:00Z",
            produtos: 128,
          },
          {
            id: "2",
            nome: "Farmácia Saúde",
            proprietario: "Maria Oliveira",
            email: "contato@farmaciasaude.com",
            telefone: "(11) 91234-5678",
            categoria: "Farmácia",
            ativa: true,
            dataCriacao: "2023-02-10T09:15:00Z",
            produtos: 85,
          },
          {
            id: "3",
            nome: "Restaurante Sabor",
            proprietario: "Pedro Santos",
            email: "contato@restaurantesabor.com",
            telefone: "(11) 97777-8888",
            categoria: "Restaurante",
            ativa: true,
            dataCriacao: "2022-11-05T16:45:00Z",
            produtos: 42,
          },
          {
            id: "4",
            nome: "Boutique Elegance",
            proprietario: "Ana Costa",
            email: "contato@boutiqueelegance.com",
            telefone: "(11) 96666-7777",
            categoria: "Vestuário",
            ativa: false,
            dataCriacao: "2023-01-20T13:10:00Z",
            produtos: 64,
          },
          {
            id: "5",
            nome: "Papelaria Criativa",
            proprietario: "Carlos Ferreira",
            email: "contato@papelaria.com",
            telefone: "(11) 95555-6666",
            categoria: "Papelaria",
            ativa: true,
            dataCriacao: "2022-12-12T11:25:00Z",
            produtos: 97,
          },
        ]

        setLojas(mockLojas)
        setFilteredLojas(mockLojas)
      } catch (error) {
        console.error("Erro ao buscar lojas:", error)
        setError("Não foi possível carregar a lista de lojas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLojas()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLojas(lojas)
    } else {
      const filtered = lojas.filter(
        (loja) =>
          loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loja.proprietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loja.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredLojas(filtered)
    }
  }, [searchTerm, lojas])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return "Data inválida"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Lojas</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button size="sm">
            <Store className="mr-2 h-4 w-4" />
            Nova Loja
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Lojas</CardTitle>
          <CardDescription>Gerencie todas as lojas da plataforma. Total: {lojas.length} lojas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar lojas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLojas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhuma loja encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLojas.map((loja) => (
                    <TableRow key={loja.id}>
                      <TableCell className="font-medium">{loja.nome}</TableCell>
                      <TableCell>{loja.proprietario}</TableCell>
                      <TableCell>
                        <div>{loja.email}</div>
                        <div className="text-sm text-muted-foreground">{loja.telefone}</div>
                      </TableCell>
                      <TableCell>{loja.categoria}</TableCell>
                      <TableCell>
                        <Badge variant={loja.ativa ? "success" : "destructive"}>
                          {loja.ativa ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(loja.dataCriacao)}</TableCell>
                      <TableCell>{loja.produtos}</TableCell>
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
                            <DropdownMenuItem>Editar loja</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Ver produtos</DropdownMenuItem>
                            <DropdownMenuItem className={loja.ativa ? "text-red-600" : "text-green-600"}>
                              {loja.ativa ? "Desativar loja" : "Ativar loja"}
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
        </CardContent>
      </Card>
    </div>
  )
}

