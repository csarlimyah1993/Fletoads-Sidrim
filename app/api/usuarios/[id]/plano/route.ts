import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const params = await context.params

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = params.id

    // Verificar se o usuário está tentando acessar seus próprios dados ou se é admin
    if (session.user.id !== userId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { db } = await connectToDatabase()

    const usuario = await db.collection("usuarios").findOne({
      _id: new ObjectId(userId),
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      plano: usuario.plano || "gratuito",
      dataAssinatura: usuario.dataAssinatura || null,
      dataExpiracao: usuario.dataExpiracao || null,
    })
  } catch (error) {
    console.error("Erro ao buscar plano do usuário:", error)
    return NextResponse.json({ error: "Erro ao buscar plano do usuário" }, { status: 500 })
  }
}
