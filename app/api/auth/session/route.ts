import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/config"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    if (!userId) {
      return NextResponse.json({ error: "ID de usuário não encontrado na sessão" }, { status: 400 })
    }

    // Buscar dados atualizados do usuário
    const { db } = await connectToDatabase()
    const user = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Retornar os dados atualizados do usuário
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.nome || "",
        email: user.email,
        role: user.role || "user",
        nome: user.nome || "",
        cargo: user.cargo || "user",
        permissoes: user.permissoes || [],
        plano: user.plano || "gratuito",
      },
    })
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST para atualizar a sessão" })
}
