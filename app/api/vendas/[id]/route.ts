import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

async function getVendaAutorizada(session: any, vendaId: string, db: any) {
  let venda
  try {
    venda = await db.collection("vendas").findOne({ _id: new ObjectId(vendaId) })
  } catch (error) {
    throw { status: 400, message: "ID de venda inválido" }
  }

  if (!venda) throw { status: 404, message: "Venda não encontrada" }

  const userId = session.user.id
  const lojas = await db
    .collection("lojas")
    .find({ $or: [{ usuarioId: userId }, { userId }] })
    .toArray()

  const lojaIds = lojas.map((loja: any) => loja._id.toString())
  if (!lojaIds.includes(venda.lojaId)) {
    throw { status: 403, message: "Venda não pertence ao usuário" }
  }

  return venda
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: vendaId } = await context.params

  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { db } = await connectToDatabase()
    const venda = await getVendaAutorizada(session, vendaId, db)

    return NextResponse.json({ ...venda, _id: venda._id.toString() })
  } catch (err: any) {
    console.error("Erro ao buscar venda:", err)
    return NextResponse.json({ error: err.message || "Erro interno do servidor" }, { status: err.status || 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: vendaId } = await context.params

  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { db } = await connectToDatabase()
    await getVendaAutorizada(session, vendaId, db)

    const data = await request.json()

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
  } catch (err: any) {
    console.error("Erro ao atualizar venda:", err)
    return NextResponse.json({ error: err.message || "Erro interno do servidor" }, { status: err.status || 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: vendaId } = await context.params

  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { db } = await connectToDatabase()
    await getVendaAutorizada(session, vendaId, db)

    const resultado = await db.collection("vendas").deleteOne({ _id: new ObjectId(vendaId) })

    if (!resultado.acknowledged || resultado.deletedCount === 0) {
      return NextResponse.json({ error: "Falha ao excluir venda" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Venda excluída com sucesso",
    })
  } catch (err: any) {
    console.error("Erro ao excluir venda:", err)
    return NextResponse.json({ error: err.message || "Erro interno do servidor" }, { status: err.status || 500 })
  }
}
