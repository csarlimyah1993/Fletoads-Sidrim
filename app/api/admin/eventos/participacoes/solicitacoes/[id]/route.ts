import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validate data
    if (!data.status || !["aprovada", "rejeitada"].includes(data.status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    // Check if ID is valid for ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de solicitação inválido" }, { status: 400 })
    }

    // Get the participation request
    const participacao = await db.collection("participacoesEventos").findOne({ _id: new ObjectId(id) })

    if (!participacao) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    // Update the participation request
    await db.collection("participacoesEventos").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: data.status,
          dataResposta: new Date().toISOString(),
          respondidoPor: session.user.id,
        },
      },
    )

    // If approved, add the store to the event participants
    if (data.status === "aprovada") {
      // Add to participacaoEventos collection
      await db.collection("participacaoEventos").insertOne({
        eventoId: participacao.eventoId,
        lojaId: participacao.lojaId,
        dataParticipacao: new Date().toISOString(),
        visitantes: 0,
        conversoes: 0,
        visualizacoes: 0,
      })

      // Update the event document
      let query = {}
      if (ObjectId.isValid(participacao.eventoId)) {
        query = { _id: new ObjectId(participacao.eventoId) }
      } else {
        query = { customId: participacao.eventoId }
      }

      // @ts-ignore - Ignoring TypeScript error for MongoDB update operation
      await db.collection("eventos").updateOne(query, { $addToSet: { lojasParticipantes: participacao.lojaId } })

      // Create notification for the store
      await db.collection("notificacoesLoja").insertOne({
        lojaId: participacao.lojaId,
        titulo: "Solicitação de participação aprovada",
        mensagem: `Sua solicitação para participar do evento ${participacao.eventoNome} foi aprovada.`,
        tipo: "success",
        lida: false,
        dataCriacao: new Date().toISOString(),
        eventoId: participacao.eventoId,
      })
    } else if (data.status === "rejeitada") {
      // Create notification for the store
      await db.collection("notificacoesLoja").insertOne({
        lojaId: participacao.lojaId,
        titulo: "Solicitação de participação rejeitada",
        mensagem: `Sua solicitação para participar do evento ${participacao.eventoNome} foi rejeitada.`,
        tipo: "error",
        lida: false,
        dataCriacao: new Date().toISOString(),
        eventoId: participacao.eventoId,
      })
    }

    return NextResponse.json({
      message: `Solicitação ${data.status === "aprovada" ? "aprovada" : "rejeitada"} com sucesso`,
    })
  } catch (error) {
    console.error("Erro ao atualizar solicitação:", error)
    return NextResponse.json({ error: "Erro ao atualizar solicitação" }, { status: 500 })
  }
}
