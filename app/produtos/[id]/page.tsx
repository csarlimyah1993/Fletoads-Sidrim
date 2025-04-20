import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { ProdutoDetalhes } from "@/components/produtos/produto-detalhes"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Produto } from "@/types/loja"

// Interface modificada para tratar params como Promise
interface ProdutoPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProdutoPageProps): Promise<Metadata> {
  try {
    const { id } = await params // Resolve a Promise aqui
    const { db } = await connectToDatabase()
    const produto = await db.collection("produtos").findOne({ _id: new ObjectId(id) })

    if (!produto) {
      return {
        title: "Produto não encontrado | FletoAds",
      }
    }

    return {
      title: `${produto.nome} | FletoAds`,
      description: produto.descricao || `Detalhes do produto ${produto.nome}`,
    }
  } catch (error) {
    return {
      title: "Produto | FletoAds",
    }
  }
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  try {
    const { id } = await params // Resolve a Promise aqui
    const { db } = await connectToDatabase()
    const produtoDoc = await db.collection("produtos").findOne({ _id: new ObjectId(id) })

    if (!produtoDoc) {
      notFound()
    }

    // Converter o documento para o tipo Produto
    const produto: Produto = {
      _id: produtoDoc._id.toString(),
      nome: produtoDoc.nome,
      descricao: produtoDoc.descricao,
      descricaoCurta: produtoDoc.descricaoCurta,
      descricaoCompleta: produtoDoc.descricaoCompleta,
      preco: produtoDoc.preco,
      precoPromocional: produtoDoc.precoPromocional,
      imagens: produtoDoc.imagens,
      estoque: produtoDoc.estoque,
      sku: produtoDoc.sku,
      categoria: produtoDoc.categoria,
      categorias: produtoDoc.categorias,
      ativo: produtoDoc.ativo,
      destaque: produtoDoc.destaque,
      dataCriacao: produtoDoc.dataCriacao,
      dataAtualizacao: produtoDoc.dataAtualizacao,
      variacoes: produtoDoc.variacoes,
      metaTitle: produtoDoc.metaTitle,
      metaDescription: produtoDoc.metaDescription,
      createdAt: produtoDoc.createdAt,
    }

    return (
      <div className="flex min-h-screen flex-col">
        <Header title={produto.nome} backUrl="/produtos" />
        <main className="flex-1">
          <div className="container py-6">
            <ProdutoDetalhes produto={produto} />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    notFound()
  }
}