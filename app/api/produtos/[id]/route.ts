import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Extrair o ID do produto para evitar o erro de acesso direto a params
    const produtoId = params.id

    const produto = await db.collection("produtos").findOne({
      _id: new ObjectId(produtoId),
      userId: session.user.id,
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

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Extrair o ID do produto para evitar o erro de acesso direto a params
    const produtoId = params.id

    const data = await request.json()

    // Verificar se o produto existe
    const produto = await db.collection("produtos").findOne({
      _id: new ObjectId(produtoId),
      userId: session.user.id,
    })

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se o SKU foi alterado e se já existe outro produto com o mesmo SKU
    if (data.sku && data.sku !== produto.sku) {
      const produtoExistente = await db.collection("produtos").findOne({
        sku: data.sku,
        userId: session.user.id,
        _id: { $ne: new ObjectId(produtoId) },
      })

      if (produtoExistente) {
        return NextResponse.json({ error: "Já existe um produto com este SKU" }, { status: 400 })
      }
    }

    // Atualizar o produto
    const produtoAtualizado = await db
      .collection("produtos")
      .findOneAndUpdate(
        { _id: new ObjectId(produtoId) },
        { $set: { ...data, dataAtualizacao: new Date() } },
        { returnDocument: "after" },
      )

    // Verificar se o produto foi atualizado com sucesso
    if (!produtoAtualizado || !produtoAtualizado.value) {
      return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
    }

    return NextResponse.json(produtoAtualizado.value)
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

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Extrair o ID do produto para evitar o erro de acesso direto a params
    const produtoId = params.id

    // Verificar se o produto existe
    const produto = await db.collection("produtos").findOne({
      _id: new ObjectId(produtoId),
      userId: session.user.id,
    })

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Excluir o produto
    await db.collection("produtos").deleteOne({ _id: new ObjectId(produtoId) })

    return NextResponse.json({ message: "Produto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}
