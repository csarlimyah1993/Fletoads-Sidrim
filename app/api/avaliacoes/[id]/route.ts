import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import Avaliacao from "@/lib/models/avaliacao"
import Loja from "@/lib/models/loja"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await connectToDatabase()

    const avaliacao = await Avaliacao.findById(id).lean()

    if (!avaliacao) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ avaliacao })
  } catch (error) {
    console.error("Erro ao buscar avaliação:", error)
    return NextResponse.json({ error: "Erro ao buscar avaliação" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const { resposta } = await request.json()

    if (!resposta) {
      return NextResponse.json({ error: "Resposta é obrigatória" }, { status: 400 })
    }

    await connectToDatabase()

    // Buscar a avaliação
    const avaliacao = await Avaliacao.findById(id)

    if (!avaliacao) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário é dono da loja
    const loja = await Loja.findOne({
      _id: avaliacao.lojaId,
      usuarioId: session.user.id,
    })

    if (!loja && session.user.role !== "admin") {
      return NextResponse.json({ error: "Você não tem permissão para responder a esta avaliação" }, { status: 403 })
    }

    // Atualizar a avaliação com a resposta
    avaliacao.resposta = resposta
    avaliacao.dataResposta = new Date()
    await avaliacao.save()

    return NextResponse.json({
      message: "Resposta adicionada com sucesso",
      avaliacao,
    })
  } catch (error) {
    console.error("Erro ao responder avaliação:", error)
    return NextResponse.json({ error: "Erro ao processar resposta" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    await connectToDatabase()

    // Buscar a avaliação
    const avaliacao = await Avaliacao.findById(id)

    if (!avaliacao) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário é o autor da avaliação ou admin
    if (avaliacao.usuarioId.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Você não tem permissão para excluir esta avaliação" }, { status: 403 })
    }

    // Excluir a avaliação
    await Avaliacao.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Avaliação excluída com sucesso",
    })
  } catch (error) {
    console.error("Erro ao excluir avaliação:", error)
    return NextResponse.json({ error: "Erro ao excluir avaliação" }, { status: 500 })
  }
}
