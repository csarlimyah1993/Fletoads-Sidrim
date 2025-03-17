import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Venda from "@/lib/models/venda"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const venda = await Venda.findById(id)
      .populate("cliente", "nome email telefone")
      .populate("produtos.produto", "nome preco")

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    return NextResponse.json(venda)
  } catch (error) {
    console.error("Erro ao buscar venda:", error)
    return NextResponse.json({ error: "Erro ao buscar venda" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const data = await request.json()

    const vendaAtualizada = await Venda.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .populate("cliente", "nome email telefone")
      .populate("produtos.produto", "nome preco")

    if (!vendaAtualizada) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    return NextResponse.json(vendaAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar venda:", error)
    return NextResponse.json({ error: "Erro ao atualizar venda" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const vendaDeletada = await Venda.findByIdAndDelete(id)

    if (!vendaDeletada) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Venda excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir venda:", error)
    return NextResponse.json({ error: "Erro ao excluir venda" }, { status: 500 })
  }
}

