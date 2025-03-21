import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    // Criar um filtro adequado para o MongoDB com tipo explícito
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter.userId = new ObjectId(userId)
    } else {
      userFilter.userId = userId
    }

    // Buscar integrações do usuário
    const userIntegracoes = await db.collection("integracoes").find(userFilter).toArray()

    // Buscar todas as integrações disponíveis
    const todasIntegracoes = await db.collection("integracoes_disponiveis").find({}).toArray()

    // Combinar as integrações disponíveis com as do usuário
    const integracoesFinais = todasIntegracoes.map((integracao) => {
      const userIntegracao = userIntegracoes.find(
        (ui) => ui.integracaoId && ui.integracaoId.toString() === integracao._id.toString(),
      )

      return {
        id: integracao._id.toString(),
        nome: integracao.nome,
        descricao: integracao.descricao,
        tipo: integracao.tipo,
        icone: integracao.icone,
        status: userIntegracao ? userIntegracao.status : "inativa",
        config: userIntegracao ? userIntegracao.config : null,
      }
    })

    return NextResponse.json(integracoesFinais)
  } catch (error) {
    console.error("Erro ao buscar integrações:", error)
    return NextResponse.json({ error: "Erro ao buscar integrações" }, { status: 500 })
  }
}

