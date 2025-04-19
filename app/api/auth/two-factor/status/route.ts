import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar informações do usuário
    const { db } = await connectToDatabase()

    const user = await db
      .collection("usuarios")
      .findOne({ _id: new ObjectId(session.user.id) }, { projection: { twoFactorEnabled: 1 } })

    return NextResponse.json({
      enabled: user?.twoFactorEnabled || false,
    })
  } catch (error) {
    console.error("Erro ao verificar status da autenticação de dois fatores:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

