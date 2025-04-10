import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import IntegracaoAtiva from "@/lib/models/integracao-ativa"
import Usuario from "@/lib/models/usuario"
import mongoose from "mongoose"

// Limites de integrações por plano
const limitesPorPlano = {
  gratuito: 1,
  basico: 3,
  profissional: 10,
  empresarial: 999, // ilimitado
}

// Obter todas as integrações ativas do usuário
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const integracoesAtivas = await IntegracaoAtiva.find({
      usuarioId: new mongoose.Types.ObjectId(session.user.id),
    }).sort({ criadoEm: -1 })

    // Buscar informações do plano do usuário
    const usuario = await Usuario.findById(session.user.id)
    const planoUsuario = usuario?.plano || "gratuito"
    const limiteIntegracoes = limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || 1

    return NextResponse.json({
      integracoesAtivas,
      planoUsuario,
      limiteIntegracoes,
      integracoesRestantes: Math.max(0, limiteIntegracoes - integracoesAtivas.length),
    })
  } catch (error) {
    console.error("Erro ao buscar integrações ativas:", error)
    return NextResponse.json({ error: "Erro ao buscar integrações ativas" }, { status: 500 })
  }
}

// Ativar uma nova integração
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { integracaoId, nome, configuracao } = await req.json()

    // Verificar se o usuário já tem esta integração ativa
    const integracaoExistente = await IntegracaoAtiva.findOne({
      usuarioId: new mongoose.Types.ObjectId(session.user.id),
      integracaoId,
    })

    if (integracaoExistente) {
      return NextResponse.json({ error: "Esta integração já está ativa" }, { status: 400 })
    }

    // Verificar o limite de integrações do plano
    const usuario = await Usuario.findById(session.user.id)
    const planoUsuario = usuario?.plano || "gratuito"
    const limiteIntegracoes = limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || 1

    const integracoesAtivas = await IntegracaoAtiva.countDocuments({
      usuarioId: new mongoose.Types.ObjectId(session.user.id),
    })

    if (integracoesAtivas >= limiteIntegracoes) {
      return NextResponse.json(
        { error: "Limite de integrações do plano atingido", planoUsuario, limiteIntegracoes },
        { status: 403 },
      )
    }

    // Criar nova integração ativa
    const novaIntegracao = new IntegracaoAtiva({
      usuarioId: new mongoose.Types.ObjectId(session.user.id),
      integracaoId,
      nome,
      configuracao: configuracao || {},
      status: "pendente",
    })

    await novaIntegracao.save()

    return NextResponse.json({
      success: true,
      integracao: novaIntegracao,
      integracoesRestantes: limiteIntegracoes - (integracoesAtivas + 1),
    })
  } catch (error) {
    console.error("Erro ao ativar integração:", error)
    return NextResponse.json({ error: "Erro ao ativar integração" }, { status: 500 })
  }
}
