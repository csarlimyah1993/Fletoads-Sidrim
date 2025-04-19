import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Limites de integrações por plano
const limitesPorPlano = {
  gratuito: 1,
  basico: 3,
  premium: 10,
  empresarial: 999, // ilimitado
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar o usuário para obter o plano
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(session.user.id) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Determinar o plano do usuário
    const planoUsuario = usuario.plano || "gratuito"

    // Buscar integrações ativas do usuário
    const integracoesAtivas = await db.collection("integracoes_ativas").find({ usuarioId: session.user.id }).toArray()

    // Calcular limite de integrações com base no plano
    const limiteIntegracoes = limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || limitesPorPlano.gratuito
    const integracoesRestantes = Math.max(0, limiteIntegracoes - integracoesAtivas.length)

    return NextResponse.json({
      planoUsuario,
      integracoesAtivas,
      limiteIntegracoes,
      integracoesRestantes,
    })
  } catch (error) {
    console.error("Erro ao buscar integrações ativas:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const body = await request.json()
    const { integracaoId, nome, configuracao } = body

    if (!integracaoId || !nome) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Buscar o usuário para obter o plano
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(session.user.id) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Determinar o plano do usuário
    const planoUsuario = usuario.plano || "gratuito"

    // Verificar se a integração já está ativa
    const integracaoExistente = await db
      .collection("integracoes_ativas")
      .findOne({ usuarioId: session.user.id, integracaoId })

    if (integracaoExistente) {
      return NextResponse.json({ error: "Esta integração já está ativa" }, { status: 400 })
    }

    // Buscar integrações ativas do usuário
    const integracoesAtivas = await db.collection("integracoes_ativas").find({ usuarioId: session.user.id }).toArray()

    // Calcular limite de integrações com base no plano
    const limiteIntegracoes = limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || limitesPorPlano.gratuito

    // Verificar se o usuário pode ativar mais integrações
    if (integracoesAtivas.length >= limiteIntegracoes) {
      return NextResponse.json(
        { error: `Você atingiu o limite de integrações do seu plano (${limiteIntegracoes})` },
        { status: 400 },
      )
    }

    // Criar nova integração ativa
    const novaIntegracao = {
      usuarioId: session.user.id,
      integracaoId,
      nome,
      configuracao: configuracao || {},
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      status: "ativa",
    }

    const result = await db.collection("integracoes_ativas").insertOne(novaIntegracao)

    // Calcular integrações restantes
    const integracoesRestantes = Math.max(0, limiteIntegracoes - (integracoesAtivas.length + 1))

    return NextResponse.json({
      integracao: {
        ...novaIntegracao,
        _id: result.insertedId,
      },
      integracoesRestantes,
    })
  } catch (error) {
    console.error("Erro ao ativar integração:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
