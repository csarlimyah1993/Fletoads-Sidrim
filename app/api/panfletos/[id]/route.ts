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

    const { id } = await params // Adicionado await aqui
    // Convert the id to an ObjectId
    const panfleto = await Panfleto.findById(new ObjectId(id)).lean()

    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(panfleto)
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

    const { id } = await params // Adicionado await aqui
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

    // Verificar si el usuario tiene permiso para editar este panfleto
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
    ).lean()

    return NextResponse.json(panfletoAtualizado)
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

    const { id } = await params // Adicionado await aqui

    // Buscar o panfleto para verificar se pertence ao usuário
    const panfleto = await Panfleto.findById(new ObjectId(id))
    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Verificar si el usuario tiene permiso para excluir este panfleto
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