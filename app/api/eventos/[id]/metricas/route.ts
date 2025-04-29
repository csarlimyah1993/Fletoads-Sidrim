import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Await params before accessing the id property
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const lojaId = searchParams.get("lojaId")

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Buscar métricas da participação
    const participacao = await db.collection("participacaoEventos").findOne({
      eventoId: id,
      lojaId,
    })

    // Se não encontrar participação, retornar métricas zeradas
    const metricas = participacao || {
      visitantes: 0,
      conversoes: 0,
      visualizacoes: 0,
    }

    return NextResponse.json({ metricas })
  } catch (error) {
    console.error("Erro ao buscar métricas:", error)
    return NextResponse.json({ error: "Erro ao buscar métricas" }, { status: 500 })
  }
}
