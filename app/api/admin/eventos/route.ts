import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Fetch all events
    const eventos = await db.collection("eventos").find({}).toArray()

    // For each event, calculate metrics
    const eventosComMetricas = await Promise.all(
      eventos.map(async (evento) => {
        // Count unique visitors
        const visitantesUnicos = await db
          .collection("visitanteeventos")
          .countDocuments({ eventoId: evento._id.toString() })

        // Count total views
        const totalVisitantes = await db.collection("visualizacoes").countDocuments({ eventoId: evento._id.toString() })

        return {
          ...evento,
          visitantesUnicos,
          totalVisitantes,
        }
      }),
    )

    return NextResponse.json({ eventos: eventosComMetricas })
  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    return NextResponse.json({ error: "Erro ao buscar eventos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validate data
    if (!data.nome || !data.dataInicio || !data.dataFim) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // If the event is marked as active, deactivate other active events
    if (data.ativo) {
      await db.collection("eventos").updateMany({ ativo: true }, { $set: { ativo: false } })
    }

    // Insert the new event
    const resultado = await db.collection("eventos").insertOne({
      nome: data.nome,
      descricao: data.descricao || "",
      imagem: data.imagem || "",
      dataInicio: new Date(data.dataInicio),
      dataFim: new Date(data.dataFim),
      ativo: data.ativo || false,
      lojasParticipantes: data.lojasParticipantes || [],
      documentos: data.documentos || [], // Add documentos array
      dataCriacao: new Date(),
      criadoPor: session.user.id,
    })

    return NextResponse.json({
      message: "Evento criado com sucesso",
      eventoId: resultado.insertedId,
    })
  } catch (error) {
    console.error("Erro ao criar evento:", error)
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 })
  }
}
