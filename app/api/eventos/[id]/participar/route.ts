import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } // Corrigido para Promise
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params // Adicionado await aqui
    const { lojaId } = await request.json()

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o evento existe
    const evento = await db.collection("eventos").findOne({ _id: new ObjectId(id) })
    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    }

    // Verificar se a loja já está participando
    const jaParticipando = evento.lojasParticipantes && evento.lojasParticipantes.includes(lojaId)
    if (jaParticipando) {
      return NextResponse.json({ message: "Loja já está participando deste evento" })
    }

    // Adicionar loja aos participantes
    await db.collection("eventos").updateOne({ _id: new ObjectId(id) }, { $addToSet: { lojasParticipantes: lojaId } })

    // Registrar participação para métricas
    await db.collection("participacaoEventos").insertOne({
      eventoId: id,
      lojaId,
      dataParticipacao: new Date(),
      visitantes: 0,
      conversoes: 0,
      visualizacoes: 0,
    })

    return NextResponse.json({ success: true, message: "Loja adicionada ao evento com sucesso" })
  } catch (error) {
    console.error("Erro ao participar do evento:", error)
    return NextResponse.json({ error: "Erro ao participar do evento" }, { status: 500 })
  }
}