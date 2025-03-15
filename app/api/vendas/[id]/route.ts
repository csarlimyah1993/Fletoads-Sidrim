import { type NextRequest, NextResponse } from "next/server"
import Venda from "@/lib/models/venda"
import mongoose from "mongoose"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada para este usuário" }, { status: 404 })
    }

    const venda = await Venda.findOne({ _id: id, lojaId: loja._id }).populate("cliente", "nome email telefone empresa")

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    return NextResponse.json(venda)
  } catch (error) {
    console.error("Erro ao buscar venda:", error)
    return NextResponse.json({ error: "Erro ao buscar venda" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada para este usuário" }, { status: 404 })
    }

    const body = await req.json()

    const venda = await Venda.findOne({ _id: id, lojaId: loja._id })

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    // Se os produtos foram atualizados, recalcular o valor total
    if (body.produtos) {
      // Calcular o subtotal para cada produto
      const produtosComSubtotal = body.produtos.map((produto: { quantidade: number; precoUnitario: number }) => ({
        ...produto,
        subtotal: produto.quantidade * produto.precoUnitario,
      }))

      body.produtos = produtosComSubtotal
      body.valorTotal = produtosComSubtotal.reduce(
        (total: number, produto: { subtotal: number }) => total + produto.subtotal,
        0,
      )
    }

    // Atualizar dados
    const vendaAtualizada = await Venda.findByIdAndUpdate(
      id,
      { ...body, dataAtualizacao: new Date() },
      { new: true },
    ).populate("cliente", "nome email telefone empresa")

    return NextResponse.json(vendaAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar venda:", error)
    return NextResponse.json({ error: "Erro ao atualizar venda" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada para este usuário" }, { status: 404 })
    }

    const venda = await Venda.findOne({ _id: id, lojaId: loja._id })

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    // Em vez de excluir, atualizar o status para cancelado
    await Venda.findByIdAndUpdate(id, { status: "cancelado", dataAtualizacao: new Date() })

    return NextResponse.json({ message: "Venda cancelada com sucesso" })
  } catch (error) {
    console.error("Erro ao cancelar venda:", error)
    return NextResponse.json({ error: "Erro ao cancelar venda" }, { status: 500 })
  }
}

