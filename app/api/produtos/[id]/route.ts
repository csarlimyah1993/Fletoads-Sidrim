import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Função para buscar um produto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Atualizar para Promise<{ id: string }>
) {
  try {
    const { id } = await params; // Aguarde a resolução do Promise para acessar 'id'

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const produtoId = id; // Usar o 'id' resolvido

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

// Função para atualizar um produto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Atualizar para Promise<{ id: string }>
) {
  try {
    const { id } = await params; // Aguarde a resolução do Promise para acessar 'id'

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const produtoId = id; // Usar o 'id' resolvido
    const data = await request.json()

    const produto = await db.collection("produtos").findOne({
      _id: new ObjectId(produtoId),
      userId: session.user.id,
    })

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se SKU foi alterado e existe outro produto com o mesmo SKU
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

    const produtoAtualizado = await db.collection("produtos").findOneAndUpdate(
      { _id: new ObjectId(produtoId) },
      { $set: { ...data, dataAtualizacao: new Date() } },
      { returnDocument: "after" }
    )

    if (!produtoAtualizado || !produtoAtualizado.value) {
      return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
    }

    return NextResponse.json(produtoAtualizado.value)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

// Função para excluir um produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Atualizar para Promise<{ id: string }>
) {
  try {
    const { id } = await params; // Aguarde a resolução do Promise para acessar 'id'

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const produtoId = id; // Usar o 'id' resolvido

    const produto = await db.collection("produtos").findOne({
      _id: new ObjectId(produtoId),
      userId: session.user.id,
    })

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    await db.collection("produtos").deleteOne({ _id: new ObjectId(produtoId) })

    return NextResponse.json({ message: "Produto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}
