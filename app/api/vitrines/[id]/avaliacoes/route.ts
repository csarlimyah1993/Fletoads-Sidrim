import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Construir a query corretamente para MongoDB
    const query: any = { $or: [] }

    // Adicionar condição para _id se for um ObjectId válido
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) })
    }

    // Adicionar outras condições
    query.$or.push({ "vitrine.slug": id })
    query.$or.push({ vitrineId: id })

    // Buscar a loja
    const loja = await db.collection("lojas").findOne(query)

    if (!loja) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    // Buscar avaliações
    const avaliacoes = await db
      .collection("vitrine_avaliacoes")
      .find({ lojaId: loja._id.toString(), aprovada: true })
      .sort({ createdAt: -1 })
      .toArray()

    // Serializar os dados
    const serializableAvaliacoes = avaliacoes.map((avaliacao) => ({
      ...avaliacao,
      _id: avaliacao._id.toString(),
      id: avaliacao._id.toString(),
      createdAt: avaliacao.createdAt ? avaliacao.createdAt.toISOString() : null,
      updatedAt: avaliacao.updatedAt ? avaliacao.updatedAt.toISOString() : null,
      data: avaliacao.data ? avaliacao.data.toISOString() : new Date().toISOString(),
    }))

    return NextResponse.json({ avaliacoes: serializableAvaliacoes })
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { nome, email, nota, comentario } = body

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    if (!nome || !nota || !comentario) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Construir a query corretamente para MongoDB
    const query: any = { $or: [] }

    // Adicionar condição para _id se for um ObjectId válido
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) })
    }

    // Adicionar outras condições
    query.$or.push({ "vitrine.slug": id })
    query.$or.push({ vitrineId: id })

    // Buscar a loja
    const loja = await db.collection("lojas").findOne(query)

    if (!loja) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    // Criar avaliação
    const avaliacao = {
      lojaId: loja._id.toString(),
      nome,
      email,
      nota: Number(nota),
      comentario,
      aprovada: true, // Auto-aprovação por padrão
      data: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("vitrine_avaliacoes").insertOne(avaliacao)

    return NextResponse.json({
      success: true,
      avaliacaoId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
