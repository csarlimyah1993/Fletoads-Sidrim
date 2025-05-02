import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID do evento é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o ID é válido para ObjectId
    let query = {}
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) }
    } else {
      // Se não for um ObjectId válido, pode ser um slug ou outro identificador
      query = { slug: id }
    }

    // Buscar o evento
    const evento = await db.collection("eventos").findOne(query)

    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    }

    // Formatar dados para retorno
    return NextResponse.json({
      evento: {
        ...evento,
        _id: evento._id.toString(),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar evento:", error)
    return NextResponse.json({ error: "Erro ao buscar evento" }, { status: 500 })
  }
}
