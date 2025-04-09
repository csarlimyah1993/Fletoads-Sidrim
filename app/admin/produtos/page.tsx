import type { Metadata } from "next"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Produtos - Admin FletoAds",
  description: "Gerenciamento de produtos da plataforma",
}

interface Produto {
  _id: string
  nome: string
  preco: number
  descricao?: string
  categoria?: string
  estoque: number
  loja?: {
    _id: string
    nome: string
  }
  ativo: boolean
  createdAt?: string
  updatedAt?: string
}

async function getProdutos() {
  try {
    // Usar URL relativa
    const res = await fetch("/api/admin/produtos", {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error(`Falha ao carregar produtos: ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return { produtos: [] }
  }
}

export default async function ProdutosPage() {
  const { produtos } = await getProdutos()

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
        <Button asChild>
          <Link href="/admin/produtos/novo">Novo Produto</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos && produtos.length > 0 ? (
              produtos.map((produto: Produto) => (
                <TableRow key={produto._id}>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>{formatarValor(produto.preco)}</TableCell>
                  <TableCell>{produto.categoria || "N/A"}</TableCell>
                  <TableCell>{produto.estoque}</TableCell>
                  <TableCell>{produto.loja?.nome || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={produto.ativo ? "success" : "destructive"}>
                      {produto.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {produto.createdAt ? format(new Date(produto.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/produtos/${produto._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/produtos/${produto._id}/editar`}>
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
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

