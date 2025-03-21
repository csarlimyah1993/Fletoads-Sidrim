import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar todos os usuários (limitado a 10 para segurança)
    const users = await db.collection("users").find({}).limit(10).toArray()

    // Retornar informações básicas para debug
    const userInfo = users.map((user) => ({
      id: user._id,
      email: user.email,
      plan: user.plan || "free",
      isFreeTrial: user.isFreeTrial || false,
      collections: Object.keys(user),
    }))

    return NextResponse.json({
      count: users.length,
      users: userInfo,
    })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

