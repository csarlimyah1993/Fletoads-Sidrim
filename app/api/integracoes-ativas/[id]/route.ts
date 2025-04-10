import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import IntegracaoAtiva from "@/lib/models/integracao-ativa"
import mongoose from "mongoose"

// Desativar uma integração
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const integracaoId = params.id

    // Verificar se a integração existe e pertence ao usuário
    const integracao = await IntegracaoAtiva.findOne({
      _id: new mongoose.Types.ObjectId(integracaoId),
      usuarioId: new mongoose.Types.ObjectId(session.user.id),
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Remover a integração
    await IntegracaoAtiva.deleteOne({ _id: new mongoose.Types.ObjectId(integracaoId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao desativar integração:", error)
    return NextResponse.json({ error: "Erro ao desativar integração" }, { status: 500 })
  }
}

// Atualizar configuração de uma integração
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const integracaoId = params.id
    const { configuracao, status } = await req.json()

    // Verificar se a integração existe e pertence ao usuário
    const integracao = await IntegracaoAtiva.findOne({
      _id: new mongoose.Types.ObjectId(integracaoId),
      usuarioId: new mongoose.Types.ObjectId(session.user.id),
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Atualizar a configuração
    const atualizacao: any = {}
    if (configuracao) atualizacao.configuracao = configuracao
    if (status) atualizacao.status = status
    if (status === "ativa") atualizacao.ultimaSincronizacao = new Date()

    const integracaoAtualizada = await IntegracaoAtiva.findByIdAndUpdate(
      integracaoId,
      { $set: atualizacao },
      { new: true },
    )

    return NextResponse.json({ success: true, integracao: integracaoAtualizada })
  } catch (error) {
    console.error("Erro ao atualizar integração:", error)
    return NextResponse.json({ error: "Erro ao atualizar integração" }, { status: 500 })
  }
}
