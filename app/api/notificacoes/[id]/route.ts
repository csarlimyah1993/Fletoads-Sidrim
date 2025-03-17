import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Notificacao from "@/lib/models/notificacao"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const notificacao = await Notificacao.findById(id)

    if (!notificacao) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(notificacao)
  } catch (error) {
    console.error("Erro ao buscar notificação:", error)
    return NextResponse.json({ error: "Erro ao buscar notificação" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const data = await request.json()

    const notificacaoAtualizada = await Notificacao.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    )

    if (!notificacaoAtualizada) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(notificacaoAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error)
    return NextResponse.json({ error: "Erro ao atualizar notificação" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const notificacaoDeletada = await Notificacao.findByIdAndDelete(id)

    if (!notificacaoDeletada) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Notificação excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir notificação:", error)
    return NextResponse.json({ error: "Erro ao excluir notificação" }, { status: 500 })
  }
}

