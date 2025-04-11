"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Produto {
  id: string
  nome: string
  preco: number
  categoria: string
  estoque: number
  imagem: string
  destaque: boolean
}

export function ProdutosRecentes() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulação de carregamento de dados
    const timer = setTimeout(() => {
      // Dados simulados
      setProdutos([
        {
          id: "1",
          nome: "Smartphone XYZ",
          preco: 1299.99,
          categoria: "Eletrônicos",
          estoque: 15,
          imagem: "/placeholder.svg?height=80&width=80",
          destaque: true,
        },
        {
          id: "2",
          nome: "Notebook Ultra",
          preco: 3499.99,
          categoria: "Informática",
          estoque: 8,
          imagem: "/placeholder.svg?height=80&width=80",
          destaque: true,
        },
        {
          id: "3",
          nome: "Fone de Ouvido Bluetooth",
          preco: 199.99,
          categoria: "Acessórios",
          estoque: 32,
          imagem: "/placeholder.svg?height=80&width=80",
          destaque: false,
        },
        {
          id: "4",
          nome: 'Smart TV 50"',
          preco: 2599.99,
          categoria: "Eletrônicos",
          estoque: 5,
          imagem: "/placeholder.svg?height=80&width=80",
          destaque: false,
        },
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium">Produtos ({produtos.length})</h4>
          <Button size="sm" asChild>
            <Link href="/dashboard/produtos/novo">Adicionar Produto</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {produtos.map((produto) => (
            <div key={produto.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded border bg-muted">
                <img
                  src={produto.imagem || "/placeholder.svg"}
                  alt={produto.nome}
                  className="h-full w-full object-cover"
                />
                {produto.destaque && (
                  <div className="absolute top-0 right-0">
                    <Badge variant="secondary" className="text-[10px]">
                      Destaque
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h5 className="font-medium">{produto.nome}</h5>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>R$ {produto.preco.toFixed(2)}</span>
                  <span>•</span>
                  <span>{produto.categoria}</span>
                  <span>•</span>
                  <span>{produto.estoque} em estoque</span>
                </div>
              </div>
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
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Ver detalhes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar produto</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
