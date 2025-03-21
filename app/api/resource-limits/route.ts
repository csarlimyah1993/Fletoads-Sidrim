import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar contagem de panfletos
    const panfletosCount = await db.collection("panfletos").countDocuments({ userId: session.user.id })

    // Buscar contagem de produtos
    const produtosCount = await db.collection("produtos").countDocuments({ userId: session.user.id })

    // Buscar informações do usuário para determinar os limites
    const userId = session.user.id

    // Criar um filtro adequado para o MongoDB com tipo explícito
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter._id = new ObjectId(userId)
    } else {
      userFilter._id = userId
    }

    const user = await db.collection("users").findOne(userFilter)

    // Definir limites com base no plano do usuário
    const isPremium = user?.plan === "premium"

    const panfletosLimit = isPremium ? 100 : 10
    const produtosLimit = isPremium ? 100 : 10
    const armazenamentoLimit = isPremium ? 1024 * 1024 * 1024 : 100 * 1024 * 1024 // 1GB ou 100MB

    // Calcular uso de armazenamento (simulado para demonstração)
    const armazenamentoUsed = Math.floor(Math.random() * armazenamentoLimit * 0.7)

    return NextResponse.json({
      panfletos: {
        used: panfletosCount,
        limit: panfletosLimit,
        percentage: (panfletosCount / panfletosLimit) * 100,
      },
      produtos: {
        used: produtosCount,
        limit: produtosLimit,
        percentage: (produtosCount / produtosLimit) * 100,
      },
      armazenamento: {
        used: armazenamentoUsed,
        limit: armazenamentoLimit,
        percentage: (armazenamentoUsed / armazenamentoLimit) * 100,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar limites de recursos:", error)
    return NextResponse.json({ error: "Erro ao buscar limites de recursos" }, { status: 500 })
  }
}

