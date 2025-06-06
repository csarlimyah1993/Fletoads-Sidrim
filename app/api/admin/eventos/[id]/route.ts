import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Check if ID is valid for ObjectId
    let query = {}
    if (id === "novo") {
      // Return empty template for new event
      return NextResponse.json({
        evento: {
          nome: "",
          descricao: "",
          imagem: "",
          dataInicio: new Date(),
          dataFim: new Date(),
          ativo: false,
          lojasParticipantes: [],
          documentos: [], // Add empty documentos array
        },
      })
    } else if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) }
    } else {
      // If not a valid ObjectId, it could be a slug or other identifier
      query = { slug: id }
    }

    // Fetch the event
    const evento = await db.collection("eventos").findOne(query)

    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    }

    // Fetch event metrics
    const visitantesUnicos = await db.collection("visitanteeventos").countDocuments({ eventoId: id })

    const totalVisitantes = await db.collection("visualizacoes").countDocuments({ eventoId: id })

    // Fetch details of participating stores
    const lojasParticipantes = await db
      .collection("lojas")
      .find({
        _id: {
          $in:
            evento.lojasParticipantes?.map((id: string) => {
              return ObjectId.isValid(id) ? new ObjectId(id) : id
            }) || [],
        },
      })
      .project({ nome: 1, logo: 1 })
      .toArray()

    // Generate registration URL
    const registrationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://lojista.fleto.com.br"}/registro?eventoId=${evento._id}`

    return NextResponse.json({
      evento: {
        ...evento,
        visitantesUnicos,
        totalVisitantes,
        lojasParticipantes,
        documentos: evento.documentos || [], // Ensure documentos is always an array
        registrationUrl, // Add registration URL
      },
    })
  } catch (error) {
    console.error("Erro ao buscar evento:", error)
    return NextResponse.json({ error: "Erro ao buscar evento" }, { status: 500 })
  }
}

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
    if (!data.nome || !data.dataInicio || !data.dataFim) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // REMOVED: The code that deactivates other events when one is activated
    // Now multiple events can be active simultaneously

    // If it's a new event, insert
    if (id === "novo") {
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
    } else {
      // Check if ID is valid for ObjectId
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "ID de evento inválido" }, { status: 400 })
      }

      // Update the existing event
      await db.collection("eventos").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            nome: data.nome,
            descricao: data.descricao || "",
            imagem: data.imagem || "",
            dataInicio: new Date(data.dataInicio),
            dataFim: new Date(data.dataFim),
            ativo: data.ativo || false,
            lojasParticipantes: data.lojasParticipantes || [],
            documentos: data.documentos || [], // Add documentos array
            ultimaAtualizacao: new Date(),
          },
        },
      )

      return NextResponse.json({ message: "Evento atualizado com sucesso" })
    }
  } catch (error) {
    console.error("Erro ao atualizar evento:", error)
    return NextResponse.json({ error: "Erro ao atualizar evento" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Check if ID is valid for ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de evento inválido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Delete the event
    await db.collection("eventos").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Evento excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir evento:", error)
    return NextResponse.json({ error: "Erro ao excluir evento" }, { status: 500 })
  }
}
