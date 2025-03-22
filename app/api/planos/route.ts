import { type NextRequest, NextResponse } from "next/server"
import { planos } from "@/lib/planos"

export async function GET(request: NextRequest) {
  try {
    // Retornar os planos diretamente da constante, sem consultar o MongoDB
    return NextResponse.json(planos)
  } catch (error) {
    console.error("Erro ao buscar planos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

