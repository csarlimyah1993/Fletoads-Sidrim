import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar evento ativo
    const evento = await db.collection("eventos").findOne({ ativo: true })

    return NextResponse.json({ evento })
  } catch (error) {
    console.error("Erro ao buscar evento ativo:", error)
    return NextResponse.json({ error: "Erro ao buscar evento ativo" }, { status: 500 })
  }
}
