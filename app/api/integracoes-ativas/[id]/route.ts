import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Limites de integrações por plano
const limitesPorPlano = {
  gratuito: 1,
  basico: 5,
  premium: 10,
  empresarial: 999,
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const integracao = await db.collection("integracoes_ativas").findOne({
      _id: new ObjectId(id),
      usuarioId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ integracao })
  } catch (error) {
    console.error("Erro ao buscar integração:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const { configuracao } = await request.json()

    const integracao = await db.collection("integracoes_ativas").findOne({
      _id: new ObjectId(id),
      usuarioId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    await db.collection("integracoes_ativas").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          configuracao: configuracao || {},
          dataAtualizacao: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true, message: "Configuração atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar integração:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const integracao = await db.collection("integracoes_ativas").findOne({
      _id: new ObjectId(id),
      usuarioId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    await db.collection("integracoes_ativas").deleteOne({ _id: new ObjectId(id) })

    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(session.user.id) })
    const planoUsuario = usuario?.plano || "gratuito"

    const integracoesAtivas = await db
      .collection("integracoes_ativas")
      .find({ usuarioId: session.user.id })
      .toArray()

    const limiteIntegracoes =
      limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || limitesPorPlano.gratuito
    const integracoesRestantes = Math.max(0, limiteIntegracoes - integracoesAtivas.length)

    return NextResponse.json({
      success: true,
      message: "Integração desativada com sucesso",
      integracoesRestantes,
    })
  } catch (error) {
    console.error("Erro ao desativar integração:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
