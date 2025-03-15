import { type NextRequest, NextResponse } from "next/server"
import Panfleto from "@/lib/models/panfleto"
import mongoose from "mongoose"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const panfleto = await Panfleto.findById(id)

    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Incrementar visualizações
    panfleto.visualizacoes += 1
    await panfleto.save()

    return NextResponse.json(panfleto)
  } catch (error) {
    console.error("Erro ao buscar panfleto:", error)
    return NextResponse.json({ error: "Erro ao buscar panfleto" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await req.json()

    const panfleto = await Panfleto.findById(id)

    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Atualizar dados
    const panfletoAtualizado = await Panfleto.findByIdAndUpdate(
      id,
      {
        ...body,
        dataAtualizacao: new Date(),
      },
      { new: true },
    )

    return NextResponse.json(panfletoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar panfleto:", error)
    return NextResponse.json({ error: "Erro ao atualizar panfleto" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const panfleto = await Panfleto.findById(id)

    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    await Panfleto.findByIdAndDelete(id)

    return NextResponse.json({ message: "Panfleto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir panfleto:", error)
    return NextResponse.json({ error: "Erro ao excluir panfleto" }, { status: 500 })
  }
}

