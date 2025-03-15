import { type NextRequest, NextResponse } from "next/server"
import Notificacao from "@/lib/models/notificacao"
import mongoose from "mongoose"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await req.json()

    const notificacao = await Notificacao.findOne({
      _id: id,
      usuario: session.user.id,
    })

    if (!notificacao) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    // Atualizar dados
    const notificacaoAtualizada = await Notificacao.findByIdAndUpdate(id, { $set: body }, { new: true })

    return NextResponse.json(notificacaoAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error)
    return NextResponse.json({ error: "Erro ao atualizar notificação" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const notificacao = await Notificacao.findOne({
      _id: id,
      usuario: session.user.id,
    })

    if (!notificacao) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    await Notificacao.findByIdAndDelete(id)

    return NextResponse.json({ message: "Notificação excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir notificação:", error)
    return NextResponse.json({ error: "Erro ao excluir notificação" }, { status: 500 })
  }
}

