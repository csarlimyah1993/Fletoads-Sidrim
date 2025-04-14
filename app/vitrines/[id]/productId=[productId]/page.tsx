import { Suspense } from "react"
import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import ProdutoDetalhe from "@/components/vitrine/produto-detalhe"

interface ProdutoPageProps {
  params: {
    id: string
    productId: string
  }
}

export default async function ProdutoPage(props: ProdutoPageProps) {
  // Use props.params instead of destructuring to avoid Next.js warning
  const id = props.params.id
  const productId = props.params.productId

  if (!id || !productId) {
    notFound()
  }

  console.log(`Buscando produto: ID da vitrine=${id}, ID do produto=${productId}`)

  // Verificar se a vitrine e o produto existem
  const { db } = await connectToDatabase()

  // Tentar converter para ObjectId se for um ID válido
  let lojaObjectId = null
  try {
    if (ObjectId.isValid(id)) {
      lojaObjectId = new ObjectId(id)
    }
  } catch (error) {
    console.log("ID da loja não é um ObjectId válido")
  }

  // Buscar a loja com várias condições
  const query = { $or: [] as any[] }

  if (lojaObjectId) {
    query.$or.push({ _id: lojaObjectId })
  }

  query.$or.push({ "vitrine.slug": id })
  query.$or.push({ vitrineId: id })

  console.log("Query para buscar loja:", JSON.stringify(query))
  const loja = await db.collection("lojas").findOne(query)

  if (!loja) {
    console.log(`Loja não encontrada para ID: ${id}`)
    notFound()
  }

  console.log(`Loja encontrada: ${loja._id}, ${loja.nome}`)

  // Buscar o produto
  let produtoObjectId = null
  try {
    if (ObjectId.isValid(productId)) {
      produtoObjectId = new ObjectId(productId)
    }
  } catch (error) {
    console.log("ID do produto não é um ObjectId válido")
  }

  if (!produtoObjectId) {
    console.log("ID do produto inválido")
    notFound()
  }

  // Buscar o produto com o ID correto
  const produtoQuery = { _id: produtoObjectId }
  console.log("Query para buscar produto:", JSON.stringify(produtoQuery))

  const produto = await db.collection("produtos").findOne(produtoQuery)

  if (!produto) {
    console.log(`Produto não encontrado para ID: ${productId}`)
    notFound()
  }

  console.log(`Produto encontrado: ${produto._id}, ${produto.nome}`)

  // Serializar os dados para evitar erros de serialização
  const serializableLoja = {
    ...JSON.parse(JSON.stringify(loja)),
    _id: loja._id.toString(),
    proprietarioId: typeof loja.proprietarioId === "object" ? loja.proprietarioId.toString() : loja.proprietarioId,
    usuarioId: typeof loja.usuarioId === "object" ? loja.usuarioId.toString() : loja.usuarioId,
  }

  const serializableProduto = {
    ...JSON.parse(JSON.stringify(produto)),
    _id: produto._id.toString(),
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Carregando produto...</p>
          </div>
        </div>
      }
    >
      <ProdutoDetalhe loja={serializableLoja} produto={serializableProduto} vitrineId={id} />
    </Suspense>
  )
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata(props: ProdutoPageProps) {
  // Use props.params instead of destructuring to avoid Next.js warning
  const id = props.params.id
  const productId = props.params.productId

  try {
    const { db } = await connectToDatabase()

    // Buscar o produto
    let produtoObjectId = null
    try {
      if (ObjectId.isValid(productId)) {
        produtoObjectId = new ObjectId(productId)
      }
    } catch (error) {
      console.log("ID do produto não é um ObjectId válido")
    }

    if (!produtoObjectId) {
      return {
        title: "Produto não encontrado",
        description: "O produto solicitado não foi encontrado.",
      }
    }

    const produto = await db.collection("produtos").findOne({ _id: produtoObjectId })

    if (!produto) {
      return {
        title: "Produto não encontrado",
        description: "O produto solicitado não foi encontrado.",
      }
    }

    return {
      title: produto.nome || "Produto",
      description: produto.descricaoCurta || `Detalhes do produto ${produto.nome}`,
      openGraph: {
        title: produto.nome || "Produto",
        description: produto.descricaoCurta || `Detalhes do produto ${produto.nome}`,
        images:
          produto.imagens && produto.imagens.length > 0
            ? [
                {
                  url: produto.imagens[0],
                  width: 1200,
                  height: 630,
                  alt: produto.nome,
                },
              ]
            : undefined,
      },
    }
  } catch (error) {
    console.error("Erro ao gerar metadados:", error)
    return {
      title: "Produto",
      description: "Detalhes do produto",
    }
  }
}
