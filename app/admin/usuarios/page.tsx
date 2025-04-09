import type { Metadata } from "next"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Usuários - Admin FletoAds",
  description: "Gerenciamento de usuários da plataforma",
}

interface Usuario {
  _id: string
  nome: string
  email: string
  role: string
  ativo: boolean
  createdAt?: string
  ultimoAcesso?: string
}

async function getUsuarios() {
  try {
    // Usar URL relativa em vez de absoluta
    const res = await fetch("/api/admin/usuarios", {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error(`Falha ao carregar usuários: ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return { usuarios: [] }
  }
}

export default async function UsuariosPage() {
  const { usuarios } = await getUsuarios()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Button asChild>
          <Link href="/admin/usuarios/novo">Novo Usuário</Link>
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
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios && usuarios.length > 0 ? (
              usuarios.map((usuario: Usuario) => (
                <TableRow key={usuario._id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant={usuario.role === "admin" ? "default" : "outline"}>
                      {usuario.role === "admin" ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.ativo ? "success" : "destructive"}>
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {usuario.createdAt ? format(new Date(usuario.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {usuario.ultimoAcesso
                      ? format(new Date(usuario.ultimoAcesso), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/usuarios/${usuario._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/usuarios/${usuario._id}/editar`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

