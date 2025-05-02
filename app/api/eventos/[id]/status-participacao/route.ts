import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const lojaId = searchParams.get("lojaId")

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o evento existe
    let eventoQuery = {}
    if (ObjectId.isValid(id)) {
      eventoQuery = { _id: new ObjectId(id) }
    } else {
      eventoQuery = { slug: id }
    }

    const evento = await db.collection("eventos").findOne(eventoQuery)

    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    }

    // Verificar se a loja está na lista de participantes do evento
    const isParticipante = evento.lojasParticipantes && evento.lojasParticipantes.some((id: string) => id === lojaId)

    if (isParticipante) {
      return NextResponse.json({ status: "aprovado" })
    }

    // Verificar se existe uma solicitação pendente
    const participacao = await db.collection("participacoesEventos").findOne({
      eventoId: evento._id.toString(),
      lojaId,
    })

    if (participacao) {
      return NextResponse.json({ status: participacao.status })
    }

    // Se não está participando e não tem solicitação
    return NextResponse.json({ status: "nao-participando" })
  } catch (error) {
    console.error("Erro ao verificar status de participação:", error)
    return NextResponse.json({ error: "Erro ao verificar status de participação" }, { status: 500 })
  }
}
