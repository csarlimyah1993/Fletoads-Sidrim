import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Panfleto } from "@/lib/models/panfleto"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    await connectToDatabase()

    const { id } = await params
    const data = await request.json()
    const { plataforma } = data // Opcional: registrar em qual plataforma foi compartilhado

    // Buscar o panfleto
    const panfleto = await Panfleto.findById(new ObjectId(id))

    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Incrementar o contador de compartilhamentos
    const panfletoAtualizado = await Panfleto.findByIdAndUpdate(
      new ObjectId(id),
      {
        $inc: { compartilhamentos: 1 },
        dataAtualizacao: new Date(),
      },
      { new: true, runValidators: true },
    )

    if (!panfletoAtualizado) {
      return NextResponse.json({ error: "Erro ao registrar compartilhamento" }, { status: 500 })
    }

    // Serializar o panfleto para evitar erros com objetos MongoDB
    const serializedPanfleto = {
      ...panfletoAtualizado.toObject(),
      _id: panfletoAtualizado._id.toString(),
      lojaId: panfletoAtualizado.lojaId ? panfletoAtualizado.lojaId.toString() : null,
      usuarioId: panfletoAtualizado.usuarioId ? panfletoAtualizado.usuarioId.toString() : null,
      dataCriacao: panfletoAtualizado.dataCriacao ? panfletoAtualizado.dataCriacao.toISOString() : null,
      dataAtualizacao: panfletoAtualizado.dataAtualizacao ? panfletoAtualizado.dataAtualizacao.toISOString() : null,
      dataInicio: panfletoAtualizado.dataInicio ? panfletoAtualizado.dataInicio.toISOString() : null,
      dataFim: panfletoAtualizado.dataFim ? panfletoAtualizado.dataFim.toISOString() : null,
      eventoId: panfletoAtualizado.eventoId ? panfletoAtualizado.eventoId.toString() : null,
    }

    return NextResponse.json({
      success: true,
      message: "Compartilhamento registrado com sucesso",
      compartilhamentos: panfletoAtualizado.compartilhamentos,
      plataforma,
      panfleto: serializedPanfleto,
    })
  } catch (error) {
    console.error("Erro ao registrar compartilhamento:", error)
    return NextResponse.json({ error: "Erro ao registrar compartilhamento" }, { status: 500 })
  }
}
