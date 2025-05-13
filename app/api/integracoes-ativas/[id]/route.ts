import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o ID é válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de integração inválido" }, { status: 400 })
    }

    // Buscar a integração
    const integracao = await db.collection("integracoes_ativas").findOne({
      _id: new ObjectId(id),
      usuarioId:
        typeof session.user.id === "string" && ObjectId.isValid(session.user.id)
          ? new ObjectId(session.user.id)
          : session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json(integracao)
  } catch (error) {
    console.error("Erro ao buscar integração:", error)
    return NextResponse.json({ error: "Erro ao buscar integração" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o ID é válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de integração inválido" }, { status: 400 })
    }

    // Obter dados da requisição
    const { configuracao, status } = await req.json()

    // Verificar se a integração existe
    const integracao = await db.collection("integracoes_ativas").findOne({
      _id: new ObjectId(id),
      usuarioId:
        typeof session.user.id === "string" && ObjectId.isValid(session.user.id)
          ? new ObjectId(session.user.id)
          : session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Atualizar a integração
    const atualizacao: Record<string, any> = {
      atualizadoEm: new Date(),
    }

    if (configuracao) {
      atualizacao.configuracao = configuracao
    }

    if (status && ["ativa", "inativa", "erro"].includes(status)) {
      atualizacao.status = status
    }

    await db.collection("integracoes_ativas").updateOne({ _id: new ObjectId(id) }, { $set: atualizacao })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar integração:", error)
    return NextResponse.json({ error: "Erro ao atualizar integração" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log(`API integracoes-ativas DELETE: Desativando integração ${id}`)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o ID é válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de integração inválido" }, { status: 400 })
    }

    // Verificar se a integração existe e pertence ao usuário
    const integracao = await db.collection("integracoes_ativas").findOne({
      _id: new ObjectId(id),
      usuarioId:
        typeof session.user.id === "string" && ObjectId.isValid(session.user.id)
          ? new ObjectId(session.user.id)
          : session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Desativar a integração (remover do banco de dados)
    await db.collection("integracoes_ativas").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API integracoes-ativas DELETE: Erro:", error)
    return NextResponse.json({ error: "Erro ao desativar integração" }, { status: 500 })
  }
}
