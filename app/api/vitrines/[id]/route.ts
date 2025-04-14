import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Destructure id from params to avoid the Next.js warning
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    console.log(`API: Buscando vitrine com ID: ${id}`)
    const { db } = await connectToDatabase()

    // Tentar converter para ObjectId se for um ID válido
    let objectId = null
    try {
      if (ObjectId.isValid(id)) {
        objectId = new ObjectId(id)
      }
    } catch (error) {
      console.log("ID não é um ObjectId válido, continuando com busca por string")
    }

    // Buscar a loja pelo ID, slug da vitrine ou vitrineId
    const loja = await db.collection("lojas").findOne({
      $or: [...(objectId ? [{ _id: objectId }] : []), { "vitrine.slug": id }, { vitrineId: id }],
    })

    if (!loja) {
      console.log(`API: Vitrine não encontrada para ID: ${id}`)
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    console.log(`API: Vitrine encontrada: ${loja._id}, ${loja.nome}`)
    const lojaId = loja._id.toString()

    // Buscar produtos da loja - agora verificando múltiplos campos
    const produtos = await db
      .collection("produtos")
      .find({
        $or: [{ lojaId: lojaId }, { lojaId: id }, { vitrineId: lojaId }, { vitrineId: id }],
        ativo: { $ne: false }, // Apenas produtos ativos
      })
      .sort({ destaque: -1, dataCriacao: -1 })
      .toArray()

    console.log(`API: Encontrados ${produtos.length} produtos`)

    // Serializar os dados para evitar erros de serialização
    const serializableLoja = {
      ...loja,
      _id: loja._id.toString(),
      dataCriacao: loja.dataCriacao ? loja.dataCriacao.toISOString() : null,
      dataAtualizacao: loja.dataAtualizacao ? loja.dataAtualizacao.toISOString() : null,
    }

    const serializableProdutos = produtos.map((produto) => ({
      ...produto,
      _id: produto._id.toString(),
      dataCriacao: produto.dataCriacao ? produto.dataCriacao.toISOString() : null,
      dataAtualizacao: produto.dataAtualizacao ? produto.dataAtualizacao.toISOString() : null,
    }))

    return NextResponse.json({
      loja: serializableLoja,
      produtos: serializableProdutos,
    })
  } catch (error) {
    console.error("Erro ao buscar vitrine:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
