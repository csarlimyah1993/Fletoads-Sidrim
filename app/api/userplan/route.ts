import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar informações do usuário
    const userId = session.user.id

    // Criar um filtro adequado para o MongoDB com tipo explícito
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter._id = new ObjectId(userId)
    } else {
      userFilter._id = userId
    }

    const user = await db.collection("users").findOne(userFilter)

    if (!user) {
      // Se o usuário não for encontrado, retornar um plano padrão
      return NextResponse.json({
        name: "free",
        isFreeTrial: false,
        daysRemaining: null,
      })
    }

    // Determinar o plano do usuário
    const planName = user.plan || "free"
    const isFreeTrial = user.isFreeTrial || false

    // Calcular dias restantes do período de teste, se aplicável
    let daysRemaining = null
    if (isFreeTrial && user.trialEndDate) {
      const trialEndDate = new Date(user.trialEndDate)
      const today = new Date()
      const diffTime = trialEndDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Se o período de teste já acabou, definir como 0
      if (daysRemaining < 0) {
        daysRemaining = 0
      }
    }

    return NextResponse.json({
      name: planName,
      isFreeTrial,
      daysRemaining,
    })
  } catch (error) {
    console.error("Erro ao buscar informações do plano:", error)
    return NextResponse.json({ error: "Erro ao buscar informações do plano" }, { status: 500 })
  }
}

