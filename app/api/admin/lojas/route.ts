import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Fetch all stores with basic information
    const lojas = await db.collection("lojas").find({}).project({ nome: 1, logo: 1, ativo: 1 }).toArray()

    return NextResponse.json({ lojas })
  } catch (error) {
    console.error("Erro ao buscar lojas:", error)
    return NextResponse.json({ error: "Erro ao buscar lojas" }, { status: 500 })
  }
}
