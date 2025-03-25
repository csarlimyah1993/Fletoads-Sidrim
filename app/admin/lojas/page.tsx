"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function LojasPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [lojas, setLojas] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulação de carregamento de dados
    const fetchLojas = async () => {
      try {
        setIsLoading(true)

        // Simulação de dados para demonstração
        // Em produção, você substituiria isso por chamadas reais à API
        setTimeout(() => {
          const mockLojas = [
            {
              id: "1",
              nome: "Mercado Central",
              proprietario: "João Silva",
              plano: "Premium",
              status: "ativo",
              dataCriacao: "2023-04-15",
            },
            {
              id: "2",
              nome: "Padaria Delícia",
              proprietario: "Maria Oliveira",
              plano: "Básico",
              status: "ativo",
              dataCriacao: "2023-03-22",
            },
            {
              id: "3",
              nome: "Farmácia Saúde",
              proprietario: "Pedro Santos",
              plano: "Empresarial",
              status: "inativo",
              dataCriacao: "2023-05-10",
            },
            {
              id: "4",
              nome: "Loja de Roupas Fashion",
              proprietario: "Ana Costa",
              plano: "Grátis",
              status: "ativo",
              dataCriacao: "2023-04-30",
            },
            {
              id: "5",
              nome: "Restaurante Sabor",
              proprietario: "Carlos Ferreira",
              plano: "Premium",
              status: "ativo",
              dataCriacao: "2023-05-05",
            },
          ]
          setLojas(mockLojas)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Erro ao buscar lojas:", error)
        setIsLoading(false)
      }
    }

    fetchLojas()
  }, [])

  // Filtrar lojas com base no termo de pesquisa
  const filteredLojas = lojas.filter(
    (loja) =>
      loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loja.proprietario.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Lojas</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Lojas</CardTitle>
          <CardDescription>Visualize e gerencie todas as lojas cadastradas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou proprietário..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLojas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma loja encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLojas.map((loja) => (
                      <TableRow key={loja.id}>
                        <TableCell className="font-medium">{loja.nome}</TableCell>
                        <TableCell>{loja.proprietario}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              loja.plano === "Empresarial"
                                ? "destructive"
                                : loja.plano === "Premium"
                                  ? "default"
                                  : loja.plano === "Básico"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {loja.plano}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={loja.status === "ativo" ? "success" : "secondary"}>
                            {loja.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(loja.dataCriacao).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/lojas/${loja.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/lojas/${loja.id}/editar`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

