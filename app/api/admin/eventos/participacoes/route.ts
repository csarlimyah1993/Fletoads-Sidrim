import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventoId = searchParams.get("eventoId")

    if (!eventoId) {
      return NextResponse.json({ error: "ID do evento é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Fetch all store participations for this event
    const participacoes = await db.collection("participacaoEventos").find({ eventoId }).toArray()

    // Fetch store details for each participation
    const lojaIds = participacoes.map((p) => p.lojaId)

    // Convert string IDs to ObjectIds where possible
    const objectIds = lojaIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id))

    // Query with both original string IDs and converted ObjectIds
    const lojas = await db
      .collection("lojas")
      .find({
        $or: [{ _id: { $in: objectIds } }, { _id: { $in: lojaIds } }],
      })
      .project({ _id: 1, nome: 1, logo: 1 })
      .toArray()

    // Create a map of store IDs to store details
    const lojasMap = lojas.reduce((acc, loja) => {
      const id = loja._id.toString()
      acc[id] = loja
      return acc
    }, {})

    // Combine participation data with store details
    const participacoesDetalhadas = participacoes.map((p) => {
      const lojaId = p.lojaId
      const loja = lojasMap[lojaId] || { nome: "Loja não encontrada" }

      return {
        ...p,
        loja,
      }
    })

    return NextResponse.json({ participacoes: participacoesDetalhadas })
  } catch (error) {
    console.error("Erro ao buscar participações:", error)
    return NextResponse.json({ error: "Erro ao buscar participações" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { eventoId, lojaId } = data

    if (!eventoId || !lojaId) {
      return NextResponse.json({ error: "ID do evento e da loja são obrigatórios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if participation already exists
    const existingParticipation = await db.collection("participacaoEventos").findOne({
      eventoId,
      lojaId,
    })

    if (existingParticipation) {
      return NextResponse.json({ error: "Loja já está participando deste evento" }, { status: 400 })
    }

    // Add store to event participants
    await db.collection("participacaoEventos").insertOne({
      eventoId,
      lojaId,
      dataParticipacao: new Date(),
      visitantes: 0,
      conversoes: 0,
      visualizacoes: 0,
    })

    // Also update the event document to include this store
    let query = {}
    if (ObjectId.isValid(eventoId)) {
      query = { _id: new ObjectId(eventoId) }
    } else {
      // If it's not a valid ObjectId, use a different approach
      query = { customId: eventoId }
    }

    // Use a different approach for the update operation
    // @ts-ignore - Ignoring TypeScript error for MongoDB update operation
    await db.collection("eventos").updateOne(query, { $addToSet: { lojasParticipantes: lojaId } })

    return NextResponse.json({ message: "Participação adicionada com sucesso" })
  } catch (error) {
    console.error("Erro ao adicionar participação:", error)
    return NextResponse.json({ error: "Erro ao adicionar participação" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventoId = searchParams.get("eventoId")
    const lojaId = searchParams.get("lojaId")

    if (!eventoId || !lojaId) {
      return NextResponse.json({ error: "ID do evento e da loja são obrigatórios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Remove store from participation collection
    await db.collection("participacaoEventos").deleteOne({
      eventoId,
      lojaId,
    })

    // Also update the event document to remove this store
    let query = {}
    if (ObjectId.isValid(eventoId)) {
      query = { _id: new ObjectId(eventoId) }
    } else {
      // If it's not a valid ObjectId, use a different approach
      query = { customId: eventoId }
    }

    // Use a different approach for the update operation
    // @ts-ignore - Ignoring TypeScript error for MongoDB update operation
    await db.collection("eventos").updateOne(query, { $pull: { lojasParticipantes: lojaId } })

    return NextResponse.json({ message: "Participação removida com sucesso" })
  } catch (error) {
    console.error("Erro ao remover participação:", error)
    return NextResponse.json({ error: "Erro ao remover participação" }, { status: 500 })
  }
}
