"use client"

import { useSearchParams } from "next/navigation"

import { useEffect, useState } from "react"
import { ProdutoCard } from "@/components/produtos/produto-card"
import type { Produto as ProdutoType } from "@/types/loja"

interface Plano {
  id: string
}

interface Loja {
  _id: string
  id: string
  nome: string
  plano?: Plano | string
  vitrine?: any
}

interface VitrineConfig {
  corPrimaria?: string
  corTexto?: string
}

interface VitrinePublicaProps {
  id?: string
  slug?: string
  layout?: "padrao" | "moderno" | "minimalista" | "magazine"
}

interface ProdutosPageClientProps {
  slug: string
  lojas: Loja[]
  produtos: ProdutoType[]
  config: VitrineConfig
}

export default function ProdutosPageClient({ slug, lojas, produtos, config }: ProdutosPageClientProps) {
  const searchParams = useSearchParams()
  const [pesquisa, setPesquisa] = useState("")
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoType[]>([])

  useEffect(() => {
    const q = searchParams.get("q")?.toLowerCase() ?? ""
    setPesquisa(q)
  }, [searchParams])

  useEffect(() => {
    const loja = lojas.find((loja): loja is Loja => loja.id === slug)

    if (!loja) return

    const isPlanoPago = typeof loja.plano === "object" && loja.plano?.id !== "gratis"

    const filtrados = produtos.filter((produto) => {
      const correspondePesquisa = produto.nome.toLowerCase().includes(pesquisa)
      const pertenceALoja = produto.lojaId === loja.id
      return correspondePesquisa && pertenceALoja
    })

    if (!isPlanoPago) {
      setProdutosFiltrados(filtrados.slice(0, 6))
    } else {
      setProdutosFiltrados(filtrados)
    }
  }, [lojas, produtos, slug, pesquisa])

  const handleShare = (produto: ProdutoType) => {
    // Implement your share logic here
    console.log(`Share product: ${produto.nome}`)
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-8">
      {produtosFiltrados.map((produto) => (
        <ProdutoCard key={produto._id} produto={produto} config={config} onShare={handleShare} />
      ))}
    </div>
  )
}
