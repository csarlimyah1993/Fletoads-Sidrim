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

    const { db } = await connectToDatabase()
    const vendaId = params.id

    // Buscar a venda
    let venda
    try {
      const objectId = new ObjectId(vendaId)
      venda = await db.collection("vendas").findOne({ _id: objectId })
    } catch (error) {
      return NextResponse.json({ error: "ID de venda inválido" }, { status: 400 })
    }

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    // Verificar se a venda pertence a uma loja do usuário
    const userId = session.user.id
    const lojas = await db
      .collection("lojas")
      .find({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
      .toArray()

    const lojaIds = lojas.map((loja) => loja._id.toString())

    if (!lojaIds.includes(venda.lojaId)) {
      return NextResponse.json({ error: "Venda não pertence ao usuário" }, { status: 403 })
    }

    return NextResponse.json({
      ...venda,
      _id: venda._id.toString(),
    })
  } catch (error) {
    console.error("Erro ao buscar venda:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const vendaId = params.id
    const data = await request.json()

    // Verificar se a venda existe
    let venda
    try {
      const objectId = new ObjectId(vendaId)
      venda = await db.collection("vendas").findOne({ _id: objectId })
    } catch (error) {
      return NextResponse.json({ error: "ID de venda inválido" }, { status: 400 })
    }

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    // Verificar se a venda pertence a uma loja do usuário
    const userId = session.user.id
    const lojas = await db
      .collection("lojas")
      .find({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
      .toArray()

    const lojaIds = lojas.map((loja) => loja._id.toString())

    if (!lojaIds.includes(venda.lojaId)) {
      return NextResponse.json({ error: "Venda não pertence ao usuário" }, { status: 403 })
    }

    // Atualizar a venda
    const resultado = await db.collection("vendas").updateOne(
      { _id: new ObjectId(vendaId) },
      {
        $set: {
          ...data,
          dataAtualizacao: new Date(),
        },
      },
    )

    if (!resultado.acknowledged) {
      return NextResponse.json({ error: "Falha ao atualizar venda" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Venda atualizada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao atualizar venda:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const vendaId = params.id

    // Verificar se a venda existe
    let venda
    try {
      const objectId = new ObjectId(vendaId)
      venda = await db.collection("vendas").findOne({ _id: objectId })
    } catch (error) {
      return NextResponse.json({ error: "ID de venda inválido" }, { status: 400 })
    }

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    // Verificar se a venda pertence a uma loja do usuário
    const userId = session.user.id
    const lojas = await db
      .collection("lojas")
      .find({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
      .toArray()

    const lojaIds = lojas.map((loja) => loja._id.toString())

    if (!lojaIds.includes(venda.lojaId)) {
      return NextResponse.json({ error: "Venda não pertence ao usuário" }, { status: 403 })
    }

    // Excluir a venda
    const resultado = await db.collection("vendas").deleteOne({ _id: new ObjectId(vendaId) })

    if (!resultado.acknowledged || resultado.deletedCount === 0) {
      return NextResponse.json({ error: "Falha ao excluir venda" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Venda excluída com sucesso",
    })
  } catch (error) {
    console.error("Erro ao excluir venda:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

