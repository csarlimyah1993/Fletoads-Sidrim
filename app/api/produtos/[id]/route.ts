import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Produto from "@/lib/models/produto"
import Loja from "@/lib/models/loja"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar a loja do usuário usando proprietarioId em vez de usuarioId
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "ID de produto inválido" }, { status: 400 })
    }

    // Buscar o produto
    const produto = await Produto.findOne({
      _id: params.id,
      lojaId: loja._id,
    })

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(produto)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar a loja do usuário usando proprietarioId em vez de usuarioId
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "ID de produto inválido" }, { status: 400 })
    }

    const data = await request.json()

    // Verificar se o produto existe
    const produto = await Produto.findOne({
      _id: params.id,
      lojaId: loja._id,
    })

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se o SKU foi alterado e se já existe outro produto com o mesmo SKU
    if (data.sku && data.sku !== produto.sku) {
      const produtoExistente = await Produto.findOne({
        sku: data.sku,
        lojaId: loja._id,
        _id: { $ne: params.id },
      })

      if (produtoExistente) {
        return NextResponse.json({ error: "Já existe um produto com este SKU" }, { status: 400 })
      }
    }

    // Atualizar o produto
    const produtoAtualizado = await Produto.findByIdAndUpdate(
      params.id,
      { ...data, dataAtualizacao: new Date() },
      { new: true },
    )

    return NextResponse.json(produtoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar a loja do usuário usando proprietarioId em vez de usuarioId
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "ID de produto inválido" }, { status: 400 })
    }

    // Verificar se o produto existe
    const produto = await Produto.findOne({
      _id: params.id,
      lojaId: loja._id,
    })

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Excluir o produto
    await Produto.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Produto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}

