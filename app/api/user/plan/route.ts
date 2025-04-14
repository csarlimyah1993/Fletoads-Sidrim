import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    // Buscar o usuário no banco de dados para obter o plano atual
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o plano do usuário é premium
    const plano = usuario.plano || session.user.plano || "gratuito"
    const isPremium = ["premium", "profissional", "empresarial"].includes(plano.toLowerCase())

    return NextResponse.json({
      plano,
      isPremium,
      // Incluir detalhes adicionais do plano se necessário
      detalhes: {
        nome: plano,
        desde: usuario.planoDesde || new Date(),
        proximaCobranca: usuario.planoProximaCobranca || null,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar plano do usuário:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
