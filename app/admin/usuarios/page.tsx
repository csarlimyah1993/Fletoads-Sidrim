"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, UserPlus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

export default function UsuariosPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulação de carregamento de dados
    const fetchUsuarios = async () => {
      try {
        setIsLoading(true)

        // Simulação de dados para demonstração
        // Em produção, você substituiria isso por chamadas reais à API
        setTimeout(() => {
          const mockUsuarios = [
            {
              id: "1",
              nome: "João Silva",
              email: "joao@exemplo.com",
              role: "user",
              status: "ativo",
              dataCriacao: "2023-04-15",
            },
            {
              id: "2",
              nome: "Maria Oliveira",
              email: "maria@exemplo.com",
              role: "admin",
              status: "ativo",
              dataCriacao: "2023-03-22",
            },
            {
              id: "3",
              nome: "Pedro Santos",
              email: "pedro@exemplo.com",
              role: "user",
              status: "inativo",
              dataCriacao: "2023-05-10",
            },
            {
              id: "4",
              nome: "Ana Costa",
              email: "ana@exemplo.com",
              role: "user",
              status: "ativo",
              dataCriacao: "2023-04-30",
            },
            {
              id: "5",
              nome: "Carlos Ferreira",
              email: "carlos@exemplo.com",
              role: "user",
              status: "ativo",
              dataCriacao: "2023-05-05",
            },
          ]
          setUsuarios(mockUsuarios)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
        setIsLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  // Filtrar usuários com base no termo de pesquisa
  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
        <Link href="/admin/usuarios/novo">
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Novo Usuário</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>Visualize, edite e gerencie todos os usuários do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou email..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.nome}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.role === "admin" ? "destructive" : "default"}>
                            {usuario.role === "admin" ? "Administrador" : "Usuário"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.status === "ativo" ? "success" : "secondary"}>
                            {usuario.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(usuario.dataCriacao).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/usuarios/${usuario.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/usuarios/${usuario.id}/editar`}>
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

