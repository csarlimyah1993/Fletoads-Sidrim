import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase, ensureCollectionsExist } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Garantir que as coleções existam
    await ensureCollectionsExist()

    // Definir filtros para buscar recursos do usuário
    const userFilter = { userId: session.user.id }

    // Buscar contagem de panfletos
    let panfletosCount = 0
    try {
      panfletosCount = await db.collection("panfletos").countDocuments(userFilter)
    } catch (error) {
      console.error("Erro ao contar panfletos:", error)
    }

    // Buscar contagem de produtos
    let produtosCount = 0
    try {
      produtosCount = await db.collection("produtos").countDocuments(userFilter)
    } catch (error) {
      console.error("Erro ao contar produtos:", error)
    }

    // Definir limites com base no plano do usuário
    let panfletosLimit = 10
    let produtosLimit = 50

    if (session.user.plano === "premium") {
      panfletosLimit = 100
      produtosLimit = 500
    } else if (session.user.plano === "business") {
      panfletosLimit = 50
      produtosLimit = 200
    }

    return NextResponse.json({
      panfletos: {
        usado: panfletosCount,
        limite: panfletosLimit,
      },
      produtos: {
        usado: produtosCount,
        limite: produtosLimit,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar limites de recursos:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar limites de recursos",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
