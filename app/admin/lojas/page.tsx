import type { Metadata } from "next"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Lojas - Admin FletoAds",
  description: "Gerenciamento de lojas da plataforma",
}

interface Loja {
  _id: string
  nome: string
  proprietario?: {
    nome: string
  }
  telefone?: string
  categoria?: string
  ativo: boolean
  createdAt?: string
  produtosCount?: number
}

async function getLojas() {
  try {
    // Usar URL relativa em vez de absoluta
    const res = await fetch("/api/admin/lojas", {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error(`Falha ao carregar lojas: ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error("Erro ao buscar lojas:", error)
    return { lojas: [] }
  }
}

export default async function LojasPage() {
  const { lojas } = await getLojas()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Lojas</h1>
        <Button asChild>
          <Link href="/admin/lojas/nova">Nova Loja</Link>
        </Button>
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
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lojas && lojas.length > 0 ? (
              lojas.map((loja: Loja) => (
                <TableRow key={loja._id}>
                  <TableCell className="font-medium">{loja.nome}</TableCell>
                  <TableCell>{loja.proprietario?.nome || "N/A"}</TableCell>
                  <TableCell>{loja.telefone || "N/A"}</TableCell>
                  <TableCell>{loja.categoria || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={loja.ativo ? "success" : "destructive"}>{loja.ativo ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                  <TableCell>
                    {loja.createdAt ? format(new Date(loja.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                  </TableCell>
                  <TableCell>{loja.produtosCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/lojas/${loja._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/lojas/${loja._id}/editar`}>
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
                <TableCell colSpan={8} className="text-center">
                  Nenhuma loja encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

