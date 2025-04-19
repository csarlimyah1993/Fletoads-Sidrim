import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar dados do usuário
    const usuario = await db.collection("usuarios").findOne({
      email: session.user.email,
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar dados da loja
    const loja = await db.collection("lojas").findOne({
      proprietarioId: usuario._id,
    })

    return NextResponse.json({
      usuario: JSON.parse(JSON.stringify(usuario)),
      loja: loja ? JSON.parse(JSON.stringify(loja)) : null,
    })
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 })
  }
}

