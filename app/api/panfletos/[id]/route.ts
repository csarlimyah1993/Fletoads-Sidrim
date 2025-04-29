import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Panfleto } from "@/lib/models/panfleto"
import { Loja } from "@/lib/models/loja"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = await params
    // Convert the id to an ObjectId
    const panfleto = await Panfleto.findById(new ObjectId(id))

    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Serializar o panfleto para evitar erros com objetos MongoDB
    const serializedPanfleto = {
      ...panfleto.toObject(),
      _id: panfleto._id.toString(),
      lojaId: panfleto.lojaId ? panfleto.lojaId.toString() : null,
      usuarioId: panfleto.usuarioId ? panfleto.usuarioId.toString() : null,
      dataCriacao: panfleto.dataCriacao ? panfleto.dataCriacao.toISOString() : null,
      dataAtualizacao: panfleto.dataAtualizacao ? panfleto.dataAtualizacao.toISOString() : null,
      dataInicio: panfleto.dataInicio ? panfleto.dataInicio.toISOString() : null,
      dataFim: panfleto.dataFim ? panfleto.dataFim.toISOString() : null,
      eventoId: panfleto.eventoId ? panfleto.eventoId.toString() : null,
    }

    return NextResponse.json(serializedPanfleto)
  } catch (error) {
    console.error("Erro ao buscar panfleto:", error)
    return NextResponse.json({ error: "Erro ao buscar panfleto" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = await params
    const data = await request.json()

    // Verificar campos obrigatórios
    const requiredFields = ["titulo", "descricao", "categoria", "imagem", "conteudo"]
    const missingFields = requiredFields.filter((field) => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Campos obrigatórios ausentes: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Buscar o panfleto para verificar se pertence ao usuário
    const panfleto = await Panfleto.findById(new ObjectId(id))
    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para editar este panfleto
    const loja = await Loja.findOne({
      $or: [
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja || panfleto.lojaId.toString() !== loja._id.toString()) {
      return NextResponse.json({ error: "Não autorizado a editar este panfleto" }, { status: 403 })
    }

    // Atualizar o panfleto
    const panfletoAtualizado = await Panfleto.findByIdAndUpdate(
      new ObjectId(id),
      {
        ...data,
        dataAtualizacao: new Date(),
      },
      { new: true, runValidators: true },
    )

    if (!panfletoAtualizado) {
      return NextResponse.json({ error: "Erro ao atualizar panfleto" }, { status: 500 })
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

    return NextResponse.json(serializedPanfleto)
  } catch (error) {
    console.error("Erro ao atualizar panfleto:", error)
    return NextResponse.json({ error: "Erro ao atualizar panfleto" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = await params

    // Buscar o panfleto para verificar se pertence ao usuário
    const panfleto = await Panfleto.findById(new ObjectId(id))
    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para excluir este panfleto
    const loja = await Loja.findOne({
      $or: [
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja || panfleto.lojaId.toString() !== loja._id.toString()) {
      return NextResponse.json({ error: "Não autorizado a excluir este panfleto" }, { status: 403 })
    }

    // Excluir o panfleto
    await Panfleto.findByIdAndDelete(new ObjectId(id))

    return NextResponse.json({ success: true, message: "Panfleto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir panfleto:", error)
    return NextResponse.json({ error: "Erro ao excluir panfleto" }, { status: 500 })
  }
}
