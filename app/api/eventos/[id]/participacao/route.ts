import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params // Await the params promise
    const { searchParams } = new URL(request.url)
    const lojaId = searchParams.get("lojaId")

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o evento existe
    const evento = await db.collection("eventos").findOne({ _id: new ObjectId(id) })
    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    }

    // Verificar se a loja está participando
    const participando = evento.lojasParticipantes && evento.lojasParticipantes.includes(lojaId)

    return NextResponse.json({ participando })
  } catch (error) {
    console.error("Erro ao verificar participação:", error)
    return NextResponse.json({ error: "Erro ao verificar participação" }, { status: 500 })
  }
}