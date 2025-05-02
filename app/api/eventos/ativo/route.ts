import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Find all active events instead of just one
    const eventosAtivos = await db
      .collection("eventos")
      .find({ ativo: true })
      .sort({ dataInicio: 1 }) // Sort by start date
      .toArray()

    if (!eventosAtivos || eventosAtivos.length === 0) {
      return NextResponse.json({ message: "Nenhum evento ativo encontrado" }, { status: 404 })
    }

    return NextResponse.json({ eventosAtivos })
  } catch (error) {
    console.error("Erro ao buscar eventos ativos:", error)
    return NextResponse.json({ error: "Erro ao buscar eventos ativos" }, { status: 500 })
  }
}
