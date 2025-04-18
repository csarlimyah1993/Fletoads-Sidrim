import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"

// Obter detalhes de uma integração
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const integracao = await WhatsappIntegracao.findOne({
      _id: id,
      userId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json(integracao)
  } catch (error) {
    console.error("Erro ao obter integração do WhatsApp:", error)
    return NextResponse.json({ error: "Erro ao obter integração do WhatsApp" }, { status: 500 })
  }
}

// Atualizar uma integração
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const dados = await req.json()

    const integracao = await WhatsappIntegracao.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: dados },
      { new: true },
    )

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json(integracao)
  } catch (error) {
    console.error("Erro ao atualizar integração do WhatsApp:", error)
    return NextResponse.json({ error: "Erro ao atualizar integração do WhatsApp" }, { status: 500 })
  }
}

// Excluir uma integração
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const integracao = await WhatsappIntegracao.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir integração do WhatsApp:", error)
    return NextResponse.json({ error: "Erro ao excluir integração do WhatsApp" }, { status: 500 })
  }
}
