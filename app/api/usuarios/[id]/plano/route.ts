import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"
import { PLAN_LIMITS } from "@/lib/plan-limits"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = params.id

    // Verificar se o usuário está tentando acessar seu próprio plano ou se é admin
    if (session.user.id !== userId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { db } = await connectToDatabase()

    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const planName = usuario.plano || "gratuito"

    // Verificar se o plano existe em nossa definição de limites
    if (PLAN_LIMITS[planName]) {
      return NextResponse.json({
        nome: PLAN_LIMITS[planName].nome || planName,
        preco: PLAN_LIMITS[planName].preco || "Grátis",
        recursos: PLAN_LIMITS[planName],
      })
    }

    // Buscar o plano do banco de dados como fall back
    const plano = await db.collection("planos").findOne({ nome: planName })

    if (!plano) {
      // Se não encontrar o plano, retorna o plano gratuito
      return NextResponse.json({
        nome: "Plano Gratuito",
        preco: "Grátis",
        recursos: PLAN_LIMITS.gratuito,
      })
    }

    return NextResponse.json({
      nome: plano.nome,
      preco: plano.preco,
      recursos: plano.recursos,
    })
  } catch (error) {
    console.error("Erro ao buscar plano:", error)
    return NextResponse.json({ error: "Erro ao buscar plano" }, { status: 500 })
  }
}
