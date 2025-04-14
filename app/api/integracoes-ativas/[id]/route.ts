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
  empresarial: 999, // ilimitado
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const id = await params.id

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar a integração ativa
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const id = await params.id

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const body = await request.json()
    const { configuracao } = body

    // Verificar se a integração existe e pertence ao usuário
    const integracao = await db.collection("integracoes_ativas").findOne({
      _id: new ObjectId(id),
      usuarioId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Atualizar configuração
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const id = await params.id

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar se a integração existe e pertence ao usuário
    const integracao = await db.collection("integracoes_ativas").findOne({
      _id: new ObjectId(id),
      usuarioId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Remover integração
    await db.collection("integracoes_ativas").deleteOne({ _id: new ObjectId(id) })

    // Buscar o usuário para obter o plano
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(session.user.id) })
    const planoUsuario = usuario?.plano || "gratuito"

    // Buscar integrações ativas do usuário
    const integracoesAtivas = await db.collection("integracoes_ativas").find({ usuarioId: session.user.id }).toArray()

    // Calcular limite de integrações com base no plano
    const limiteIntegracoes = limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || limitesPorPlano.gratuito
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
