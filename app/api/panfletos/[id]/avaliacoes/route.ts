import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Panfleto } from "@/lib/models/panfleto"
import { PanfletoAvaliacao } from "@/lib/models/panfleto-avaliacao"

// GET - Buscar avaliações de um panfleto
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await params

    // Verificar se o panfleto existe
    const panfleto = await Panfleto.findById(new ObjectId(id))
    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Buscar avaliações
    const avaliacoes = await PanfletoAvaliacao.find({ panfletoId: new ObjectId(id) })
      .sort({ data: -1 }) // Ordenar por data decrescente (mais recentes primeiro)
      .lean() // Para melhor performance

    // Serializar as avaliações
    const serializedAvaliacoes = avaliacoes.map((avaliacao: any) => ({
      ...avaliacao,
      _id: avaliacao._id.toString(),
      id: avaliacao._id.toString(),
      panfletoId: avaliacao.panfletoId.toString(),
      lojaId: avaliacao.lojaId ? avaliacao.lojaId.toString() : null,
      usuarioId: avaliacao.usuarioId ? avaliacao.usuarioId.toString() : null,
      data: avaliacao.data ? avaliacao.data.toISOString() : new Date().toISOString(),
    }))

    return NextResponse.json(serializedAvaliacoes)
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json({ error: "Erro ao buscar avaliações" }, { status: 500 })
  }
}

// POST - Adicionar uma nova avaliação
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    await connectToDatabase()

    const { id } = await params
    const data = await request.json()

    // Verificar campos obrigatórios
    const requiredFields = ["nome", "nota", "comentario"]
    const missingFields = requiredFields.filter((field) => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Campos obrigatórios ausentes: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Verificar se o panfleto existe
    const panfleto = await Panfleto.findById(new ObjectId(id))
    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Criar a avaliação
    const novaAvaliacao = new PanfletoAvaliacao({
      panfletoId: new ObjectId(id),
      lojaId: panfleto.lojaId,
      nome: data.nome,
      email: data.email || null,
      nota: data.nota,
      comentario: data.comentario,
      usuarioId: session?.user?.id || null,
      data: new Date(),
      status: "aprovado", // Ou "pendente" se quiser moderação
    })

    await novaAvaliacao.save()

    // Incrementar o contador de comentários no panfleto
    await Panfleto.findByIdAndUpdate(new ObjectId(id), {
      $inc: { comentarios: 1 },
      dataAtualizacao: new Date(),
    })

    // Serializar a avaliação
    const serializedAvaliacao = {
      ...novaAvaliacao.toObject(),
      _id: novaAvaliacao._id.toString(),
      id: novaAvaliacao._id.toString(),
      panfletoId: novaAvaliacao.panfletoId.toString(),
      lojaId: novaAvaliacao.lojaId ? novaAvaliacao.lojaId.toString() : null,
      usuarioId: novaAvaliacao.usuarioId ? novaAvaliacao.usuarioId.toString() : null,
      data: novaAvaliacao.data ? novaAvaliacao.data.toISOString() : null,
    }

    return NextResponse.json({
      success: true,
      message: "Avaliação enviada com sucesso",
      avaliacao: serializedAvaliacao,
    })
  } catch (error) {
    console.error("Erro ao enviar avaliação:", error)
    return NextResponse.json({ error: "Erro ao enviar avaliação" }, { status: 500 })
  }
}
