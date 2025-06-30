import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Validação segura de ObjectId
function isObjectIdLike(id: any): boolean {
  return typeof id === "string" && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    let usuario = null

    if (isObjectIdLike(userId)) {
      usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
    } else {
      usuario = await db.collection("usuarios").findOne({ id: userId }) // fallback se você salvar `id` como string
    }

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const plano = usuario.plano || session.user.plano || "gratuito"
    const isPremium = ["premium", "profissional", "empresarial"].includes(plano.toLowerCase())

    return NextResponse.json({
      plano,
      isPremium,
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
