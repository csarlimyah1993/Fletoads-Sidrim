import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

type ParamsContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    console.log(`API: Buscando vitrine com ID: ${id}`)
    const { db } = await connectToDatabase()

    let objectId: ObjectId | null = null
    if (ObjectId.isValid(id)) {
      objectId = new ObjectId(id)
    }

    const loja = await db.collection("lojas").findOne({
      $or: [
        ...(objectId ? [{ _id: objectId }] : []),
        { "vitrine.slug": id },
        { vitrineId: id },
      ],
    })

    if (!loja) {
      console.log(`API: Vitrine não encontrada para ID: ${id}`)
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    console.log(`API: Vitrine encontrada: ${loja._id}, ${loja.nome}`)
    const lojaId = loja._id.toString()

    const produtos = await db
      .collection("produtos")
      .find({
        $or: [
          { lojaId: lojaId },
          { lojaId: id },
          { vitrineId: lojaId },
          { vitrineId: id },
        ],
        ativo: { $ne: false },
      })
      .sort({ destaque: -1, dataCriacao: -1 })
      .toArray()

    console.log(`API: Encontrados ${produtos.length} produtos`)

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
