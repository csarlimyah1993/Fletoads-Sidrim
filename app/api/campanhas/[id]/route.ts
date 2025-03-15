import { type NextRequest, NextResponse } from "next/server"
import Campanha from "@/lib/models/campanha"
import mongoose from "mongoose"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const campanha = await Campanha.findById(id)
      .populate("responsavel", "nome email")
      .populate("panfletos", "titulo imagem conteudo")
      .populate("clientes", "nome empresa email telefone")

    if (!campanha) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    return NextResponse.json(campanha)
  } catch (error) {
    console.error("Erro ao buscar campanha:", error)
    return NextResponse.json({ error: "Erro ao buscar campanha" }, { status: 500 })
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

    const campanha = await Campanha.findById(id)

    if (!campanha) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    // Atualizar dados
    const campanhaAtualizada = await Campanha.findByIdAndUpdate(id, body, { new: true })

    return NextResponse.json(campanhaAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar campanha:", error)
    return NextResponse.json({ error: "Erro ao atualizar campanha" }, { status: 500 })
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

    const campanha = await Campanha.findById(id)

    if (!campanha) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    await Campanha.findByIdAndDelete(id)

    return NextResponse.json({ message: "Campanha excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir campanha:", error)
    return NextResponse.json({ error: "Erro ao excluir campanha" }, { status: 500 })
  }
}

