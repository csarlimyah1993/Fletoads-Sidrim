import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Venda, ItemVenda, Cliente, Produto } from "@/types/entities"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id: vendaId } = await context.params
    const userId = session.user.id

    const { db } = await connectToDatabase()

    const venda = await db.collection<Venda>("vendas").findOne({ _id: new ObjectId(vendaId) })
    if (!venda) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })

    const loja = await db.collection("lojas").findOne({
      $or: [
        { proprietarioId: userId },
        { proprietarioId: new ObjectId(userId) },
        { usuarioId: userId },
        { usuarioId: new ObjectId(userId) },
      ],
    })

    if (!loja || loja._id.toString() !== venda.lojaId.toString()) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const cliente = await db.collection<Cliente>("clientes").findOne({
      _id: new ObjectId(venda.clienteId.toString()),
    })

    const produtoIds = venda.itens.map((item: ItemVenda) => item.produtoId)
    const produtos = await db
      .collection<Produto>("produtos")
      .find({ _id: { $in: produtoIds.map((id) => new ObjectId(id.toString())) } })
      .toArray()

    const produtosMap: Record<string, Produto> = {}
    produtos.forEach((produto) => {
      produtosMap[produto._id.toString()] = produto
    })

    const itensEnriquecidos = venda.itens.map((item: ItemVenda) => {
      const produto = produtosMap[item.produtoId.toString()]
      return {
        ...item,
        produto: produto
          ? {
              _id: produto._id.toString(),
              nome: produto.nome,
              preco: produto.preco,
              imagem: produto.imagem,
            }
          : undefined,
      }
    })

    const vendaSerializada = {
      ...venda,
      _id: venda._id?.toString(),
      clienteId: venda.clienteId.toString(),
      lojaId: venda.lojaId.toString(),
      dataCriacao: venda.dataCriacao?.toISOString() || null,
      dataAtualizacao: venda.dataAtualizacao?.toISOString() || null,
      cliente: cliente
        ? {
            _id: cliente._id.toString(),
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone,
          }
        : null,
      itens: itensEnriquecidos,
    }

    return NextResponse.json({ venda: vendaSerializada })
  } catch (error) {
    console.error("Erro ao buscar venda:", error)
    return NextResponse.json({ error: "Erro ao buscar venda" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id: vendaId } = await context.params
    const userId = session.user.id
    const data = await request.json()

    const { db } = await connectToDatabase()

    const venda = await db.collection<Venda>("vendas").findOne({ _id: new ObjectId(vendaId) })
    if (!venda) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })

    const loja = await db.collection("lojas").findOne({
      $or: [
        { proprietarioId: userId },
        { proprietarioId: new ObjectId(userId) },
        { usuarioId: userId },
        { usuarioId: new ObjectId(userId) },
      ],
    })

    if (!loja || loja._id.toString() !== venda.lojaId.toString()) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const camposPermitidos = ["status", "formaPagamento", "observacao"]
    const atualizacao: Record<string, any> = {}

    for (const campo of camposPermitidos) {
      if (data[campo] !== undefined) {
        atualizacao[campo] = data[campo]
      }
    }

    atualizacao["dataAtualizacao"] = new Date()

    await db.collection("vendas").updateOne({ _id: new ObjectId(vendaId) }, { $set: atualizacao })

    return NextResponse.json({ success: true, message: "Venda atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar venda:", error)
    return NextResponse.json({ error: "Erro ao atualizar venda" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id: vendaId } = await context.params
    const userId = session.user.id

    const { db } = await connectToDatabase()

    const venda = await db.collection<Venda>("vendas").findOne({ _id: new ObjectId(vendaId) })
    if (!venda) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })

    const loja = await db.collection("lojas").findOne({
      $or: [
        { proprietarioId: userId },
        { proprietarioId: new ObjectId(userId) },
        { usuarioId: userId },
        { usuarioId: new ObjectId(userId) },
      ],
    })

    if (!loja || loja._id.toString() !== venda.lojaId.toString()) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    await db.collection("vendas").updateOne(
      { _id: new ObjectId(vendaId) },
      { $set: { status: "cancelada", dataAtualizacao: new Date() } }
    )

    for (const item of venda.itens) {
      await db
        .collection("produtos")
        .updateOne({ _id: new ObjectId(item.produtoId.toString()) }, { $inc: { estoque: item.quantidade } })
    }

    await db.collection("clientes").updateOne(
      { _id: new ObjectId(venda.clienteId.toString()) },
      {
        $inc: {
          totalGasto: -venda.total,
          numeroPedidos: -1,
        },
      }
    )

    return NextResponse.json({ success: true, message: "Venda cancelada com sucesso" })
  } catch (error) {
    console.error("Erro ao cancelar venda:", error)
    return NextResponse.json({ error: "Erro ao cancelar venda" }, { status: 500 })
  }
}
