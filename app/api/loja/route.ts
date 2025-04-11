import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Buscar o usuário para obter o ID da loja
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário tem uma loja associada
    if (!usuario.lojaId) {
      return NextResponse.json({ error: "Usuário não possui loja" }, { status: 404 })
    }

    // Buscar a loja
    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(usuario.lojaId.toString()) })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar produtos da loja
    const produtos = await db.collection("produtos").find({ lojaId: usuario.lojaId.toString() }).toArray()

    // Adicionar produtos à resposta
    const lojaComProdutos = {
      ...loja,
      produtos: produtos || [],
    }

    return NextResponse.json(lojaComProdutos)
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao buscar loja" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Verificar se o usuário já tem uma loja
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (usuario.lojaId) {
      return NextResponse.json({ error: "Usuário já possui uma loja" }, { status: 400 })
    }

    const data = await request.json()

    // Criar a loja
    const resultado = await db.collection("lojas").insertOne({
      ...data,
      usuarioId: userId,
      dataCriacao: new Date(),
      vitrineConfigurada: false,
    })

    // Atualizar o usuário com o ID da loja
    await db.collection("usuarios").updateOne({ _id: new ObjectId(userId) }, { $set: { lojaId: resultado.insertedId } })

    return NextResponse.json({
      message: "Loja criada com sucesso",
      lojaId: resultado.insertedId,
    })
  } catch (error) {
    console.error("Erro ao criar loja:", error)
    return NextResponse.json({ error: "Erro ao criar loja" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Buscar o usuário para obter o ID da loja
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (!usuario.lojaId) {
      return NextResponse.json({ error: "Usuário não possui loja" }, { status: 404 })
    }

    const data = await request.json()

    // Atualizar a loja
    await db
      .collection("lojas")
      .updateOne({ _id: new ObjectId(usuario.lojaId.toString()) }, { $set: { ...data, dataAtualizacao: new Date() } })

    return NextResponse.json({ message: "Loja atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar loja:", error)
    return NextResponse.json({ error: "Erro ao atualizar loja" }, { status: 500 })
  }
}
