import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Produto from "@/lib/models/produto"
import Loja from "@/lib/models/loja"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Buscar um produto pelo ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    // Extrair o ID dos parâmetros
    const { id } = await context.params

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de produto inválido" }, { status: 400 })
    }

    // Buscar o produto
    const produto = await Produto.findById(id)

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(produto)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

// PUT - Atualizar um produto
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Extrair o ID dos parâmetros
    const { id } = await context.params

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de produto inválido" }, { status: 400 })
    }

    // Obter dados do corpo da requisição
    const data = await request.json()

    // Buscar o produto para verificar permissões
    const produto = await Produto.findById(id)

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário é proprietário da loja
    const loja = await Loja.findById(produto.lojaId)

    if (!loja || loja.proprietarioId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Você não tem permissão para editar este produto" }, { status: 403 })
    }

    // Atualizar o produto
    const produtoAtualizado = await Produto.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    return NextResponse.json(produtoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

// DELETE - Excluir um produto
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Extrair o ID dos parâmetros
    const { id } = await context.params

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de produto inválido" }, { status: 400 })
    }

    // Buscar o produto para verificar permissões
    const produto = await Produto.findById(id)

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário é proprietário da loja
    const loja = await Loja.findById(produto.lojaId)

    if (!loja || loja.proprietarioId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Você não tem permissão para excluir este produto" }, { status: 403 })
    }

    // Excluir o produto
    await Produto.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}

