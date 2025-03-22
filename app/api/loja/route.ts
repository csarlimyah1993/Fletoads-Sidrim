import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    const loja = await db.collection("lojas").findOne({
      $or: [{ usuarioId: userId }, { userId: userId }],
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Atualizar os dados da loja
    const resultado = await db
      .collection("lojas")
      .updateOne({ _id: new ObjectId(loja._id) }, { $set: { ...data, dataAtualizacao: new Date() } })

    if (!resultado.acknowledged) {
      return NextResponse.json({ error: "Falha ao atualizar loja" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Loja atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar loja:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    const loja = await db.collection("lojas").findOne({
      $or: [{ usuarioId: userId }, { userId: userId }],
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Converter o ObjectId para string
    return NextResponse.json({
      ...loja,
      _id: loja._id.toString(),
    })
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Adicione o método POST para criar uma nova loja
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    const { db } = await connectToDatabase()

    // Criar uma nova loja
    const novaLoja = {
      ...data,
      usuarioId: userId,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      ativo: true,
    }

    const resultado = await db.collection("lojas").insertOne(novaLoja)

    if (!resultado.acknowledged) {
      return NextResponse.json({ error: "Falha ao criar loja" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Loja criada com sucesso",
      loja: {
        ...novaLoja,
        _id: resultado.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("Erro ao criar loja:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

