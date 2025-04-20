import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { ProdutoConfiguracoes } from "@/components/produtos/produto-configuracoes"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Produto } from "@/types/loja"

interface ProdutoConfiguracoesPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProdutoConfiguracoesPageProps): Promise<Metadata> {
  try {
    const { db } = await connectToDatabase()
    const produto = await db.collection("produtos").findOne({ _id: new ObjectId(params.id) })

    if (!produto) {
      return {
        title: "Configurações do Produto | FletoAds",
      }
    }

    return {
      title: `Configurações: ${produto.nome} | FletoAds`,
      description: `Configurações do produto ${produto.nome}`,
    }
  } catch (error) {
    return {
      title: "Configurações do Produto | FletoAds",
    }
  }
}

export default async function ProdutoConfiguracoesPage({ params }: ProdutoConfiguracoesPageProps) {
  try {
    const { db } = await connectToDatabase()
    const produtoDoc = await db.collection("produtos").findOne({ _id: new ObjectId(params.id) })

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
      metaTitle: produtoDoc.metaTitle,
      metaDescription: produtoDoc.metaDescription,
      variacoes: produtoDoc.variacoes,
    }

    return (
      <div className="flex min-h-screen flex-col">
        <Header title={`Configurações: ${produto.nome}`} backUrl={`/produtos/${params.id}`} />
        <main className="flex-1">
          <div className="container py-6">
            <ProdutoConfiguracoes produto={produto} />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
