import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object before accessing its properties
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID da vitrine não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Buscar avaliações
    const avaliacoes = await db.collection("avaliacoes").find({ vitrineId: id }).sort({ dataCriacao: -1 }).toArray()

    // Formatar as avaliações para o cliente
    const avaliacoesFormatadas = avaliacoes.map((avaliacao) => ({
      id: avaliacao._id.toString(),
      nome: avaliacao.nome,
      email: avaliacao.email,
      nota: avaliacao.nota,
      comentario: avaliacao.comentario,
      data: avaliacao.dataCriacao,
      avatar: avaliacao.avatar || null,
    }))

    return NextResponse.json({ avaliacoes: avaliacoesFormatadas })
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json({ error: "Erro ao buscar avaliações" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object before accessing its properties
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID da vitrine não fornecido" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    const body = await request.json()

    // Validar dados
    if (!body.nome || !body.comentario || !body.nota) {
      return NextResponse.json({ error: "Nome, comentário e nota são obrigatórios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se a vitrine existe
    const vitrineId: string = id
    let lojaId: string | ObjectId | undefined = body.lojaId

    try {
      // Tentar converter para ObjectId se for um ID válido
      if (body.lojaId && ObjectId.isValid(body.lojaId)) {
        lojaId = new ObjectId(body.lojaId)
      }
    } catch (error) {
      console.error("Erro ao converter ID:", error)
    }

    // Verificar se a vitrine existe usando string ou ObjectId
    const vitrine = await db.collection("lojas").findOne({
      $or: [{ "vitrine.slug": id }, ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])],
    })

    if (!vitrine) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    // Criar avaliação
    const avaliacao = {
      vitrineId: id,
      lojaId: vitrine._id,
      nome: body.nome,
      email: body.email || null,
      nota: Number.parseInt(body.nota) || 5,
      comentario: body.comentario,
      dataCriacao: new Date(),
      usuarioId: session?.user?.id || null,
      avatar: null, // Pode ser implementado posteriormente
    }

    const resultado = await db.collection("avaliacoes").insertOne(avaliacao)

    // Atualizar média de avaliações da loja
    const todasAvaliacoes = await db.collection("avaliacoes").find({ lojaId: vitrine._id }).toArray()
    const mediaAvaliacoes = todasAvaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / todasAvaliacoes.length

    await db
      .collection("lojas")
      .updateOne({ _id: vitrine._id }, { $set: { "vitrine.mediaAvaliacoes": mediaAvaliacoes } })

    return NextResponse.json({
      success: true,
      id: resultado.insertedId.toString(),
      message: "Avaliação enviada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao enviar avaliação:", error)
    return NextResponse.json({ error: "Erro ao enviar avaliação" }, { status: 500 })
  }
}
