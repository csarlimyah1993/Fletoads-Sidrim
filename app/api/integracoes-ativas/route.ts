import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Limites de integrações por plano
const limitesPorPlano = {
  gratuito: 1,
  basico: 3,
  profissional: 10,
  premium: 999, // ilimitado
  empresarial: 999, // ilimitado
}

export async function GET(req: NextRequest) {
  try {
    console.log("API integracoes-ativas: Iniciando busca")
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log(`API integracoes-ativas: Usuário autenticado: ${session.user.email}`)

    const { db } = await connectToDatabase()

    // Buscar o usuário para obter o plano
    let planoUsuario = "gratuito"
    const userId = session.user.id

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      console.log(`API integracoes-ativas: Busca por ID ObjectId: encontrado`)
      const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
      if (usuario) {
        planoUsuario = usuario.plano || "gratuito"
      }
    } else {
      console.log(`API integracoes-ativas: Busca por ID string: ${userId}`)
      // Usar uma consulta que funciona com diferentes tipos de ID
      const usuario = await db.collection("usuarios").findOne({
        $or: [{ userId: userId }, { email: session.user.email }, { username: session.user.email }],
      })
      if (usuario) {
        planoUsuario = usuario.plano || "gratuito"
      }
    }

    console.log(`API integracoes-ativas: Plano do usuário: ${planoUsuario}`)

    // Substitua a consulta de integracoesAtivas (linhas 48-52) com o seguinte código:
    // Buscar integrações ativas do usuário
    let query = {}
    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      query = { usuarioId: new ObjectId(userId) }
    } else {
      query = {
        $or: [{ usuarioId: userId }, { "usuario.email": session.user.email }, { "usuario.id": userId }],
      }
    }

    const integracoesAtivas = await db.collection("integracoes_ativas").find(query).toArray()

    console.log(`API integracoes-ativas: Integrações ativas encontradas: ${integracoesAtivas.length}`)

    // Calcular limites com base no plano
    const limiteIntegracoes = limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || limitesPorPlano.gratuito
    const integracoesRestantes = Math.max(0, limiteIntegracoes - integracoesAtivas.length)

    console.log(
      `API integracoes-ativas: Limite de integrações: ${limiteIntegracoes}, Restantes: ${integracoesRestantes}`,
    )

    return NextResponse.json({
      integracoesAtivas,
      planoUsuario,
      limiteIntegracoes,
      integracoesRestantes,
    })
  } catch (error) {
    console.error("API integracoes-ativas: Erro:", error)
    return NextResponse.json({ error: "Erro ao buscar integrações ativas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("API integracoes-ativas POST: Iniciando")
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar o usuário para obter o plano
    let planoUsuario = "gratuito"
    const userId = session.user.id

    // Substitua a consulta de usuário no método POST (linhas 82-89) com o seguinte código:
    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
      if (usuario) {
        planoUsuario = usuario.plano || "gratuito"
      }
    } else {
      const usuario = await db.collection("usuarios").findOne({
        $or: [{ userId: userId }, { email: session.user.email }, { username: session.user.email }],
      })
      if (usuario) {
        planoUsuario = usuario.plano || "gratuito"
      }
    }

    console.log(`API integracoes-ativas POST: Plano do usuário: ${planoUsuario}`)

    // Substitua a consulta de integracoesAtivas no método POST (linhas 93-98) com o seguinte código:
    // Buscar integrações ativas do usuário
    let query = {}
    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      query = { usuarioId: new ObjectId(userId) }
    } else {
      query = {
        $or: [{ usuarioId: userId }, { "usuario.email": session.user.email }, { "usuario.id": userId }],
      }
    }

    const integracoesAtivas = await db.collection("integracoes_ativas").find(query).toArray()

    console.log(
      `API integracoes-ativas POST: Integrações ativas: ${integracoesAtivas.length}, Limite: ${limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || limitesPorPlano.gratuito}`,
    )

    // Verificar se o usuário pode ativar mais integrações
    const limiteIntegracoes = limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || limitesPorPlano.gratuito
    if (integracoesAtivas.length >= limiteIntegracoes) {
      return NextResponse.json(
        { error: `Você atingiu o limite de integrações do seu plano (${limiteIntegracoes})` },
        { status: 403 },
      )
    }

    // Obter dados da requisição
    const { integracaoId, nome, configuracao } = await req.json()

    if (!integracaoId || !nome) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se a integração já está ativa
    const integracaoExistente = integracoesAtivas.find((integracao) => integracao.integracaoId === integracaoId)
    if (integracaoExistente) {
      return NextResponse.json({ error: "Esta integração já está ativa" }, { status: 400 })
    }

    // Criar nova integração ativa
    const userIdForDb = typeof userId === "string" && ObjectId.isValid(userId) ? new ObjectId(userId) : userId

    const novaIntegracao = {
      integracaoId,
      nome,
      configuracao: configuracao || {},
      status: "ativa",
      usuarioId: userIdForDb,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    }

    const resultado = await db.collection("integracoes_ativas").insertOne(novaIntegracao)

    return NextResponse.json(
      {
        success: true,
        integracao: {
          _id: resultado.insertedId,
          ...novaIntegracao,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API integracoes-ativas POST: Erro:", error)
    return NextResponse.json({ error: "Erro ao ativar integração" }, { status: 500 })
  }
}
