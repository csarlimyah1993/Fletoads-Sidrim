"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MoreHorizontal, Edit, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Usuario {
  _id: string
  nome?: string
  name?: string
  email: string
  role: string
  permissoes?: string[]
}

// Lista de permissões disponíveis
const permissoesDisponiveis = [
  "gerenciar_usuarios",
  "gerenciar_lojas",
  "gerenciar_produtos",
  "gerenciar_panfletos",
  "gerenciar_planos",
  "gerenciar_configuracoes",
  "visualizar_relatorios",
]

export default function PermissoesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/permissoes")

        if (!response.ok) {
          throw new Error(`Erro ao buscar usuários: ${response.status}`)
        }

        const data = await response.json()
        setUsuarios(data.usuarios || [])
      } catch (err) {
        console.error("Erro ao buscar usuários:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar usuários")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      (usuario.nome || usuario.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Verificar se o usuário tem uma permissão específica
  const temPermissao = (usuario: Usuario, permissao: string) => {
    if (usuario.role === "admin") return true
    return usuario.permissoes?.includes(permissao) || false
  }

  // Formatar nome da permissão para exibição
  const formatarNomePermissao = (permissao: string) => {
    return permissao
      .replace(/_/g, " ")
      .split(" ")
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissões de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Usuário</th>
                    <th className="text-left py-3 px-4 font-medium">Função</th>
                    {permissoesDisponiveis.map((permissao) => (
                      <th key={permissao} className="text-center py-3 px-4 font-medium">
                        {formatarNomePermissao(permissao)}
                      </th>
                    ))}
                    <th className="text-right py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <tr key={usuario._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{usuario.nome || usuario.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{usuario.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              usuario.role === "admin"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {usuario.role === "admin" ? "Administrador" : "Usuário"}
                          </span>
                        </td>
                        {permissoesDisponiveis.map((permissao) => (
                          <td key={`${usuario._id}-${permissao}`} className="text-center py-3 px-4">
                            {temPermissao(usuario, permissao) ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <Edit className="h-4 w-4" />
                                <span>Editar permissões</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
