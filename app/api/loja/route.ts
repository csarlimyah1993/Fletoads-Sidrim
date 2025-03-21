import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    // Criar um filtro adequado para o MongoDB com tipo explícito
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter.userId = new ObjectId(userId)
    } else {
      userFilter.userId = userId
    }

    console.log("Buscando loja para o usuário:", userFilter)

    const loja = await db.collection("lojas").findOne(userFilter)

    if (!loja) {
      // Se não encontrar uma loja, retornar um objeto vazio em vez de 404
      return NextResponse.json({
        nome: "",
        descricao: "",
        endereco: "",
        telefone: "",
        email: "",
        website: "",
        horarioFuncionamento: "",
        instagram: "",
        facebook: "",
        ativo: true,
        logo: "",
      })
    }

    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao buscar loja" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id
    const data = await req.json()

    // Criar um filtro adequado para o MongoDB com tipo explícito
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter.userId = new ObjectId(userId)
    } else {
      userFilter.userId = userId
    }

    // Verificar se a loja já existe
    const existingLoja = await db.collection("lojas").findOne(userFilter)

    if (existingLoja) {
      // Atualizar loja existente
      const result = await db.collection("lojas").updateOne(userFilter, { $set: { ...data, updatedAt: new Date() } })

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
      }

      const updatedLoja = await db.collection("lojas").findOne(userFilter)
      return NextResponse.json(updatedLoja)
    } else {
      // Criar nova loja
      const newLoja = {
        ...data,
        userId: typeof userId === "string" && ObjectId.isValid(userId) ? new ObjectId(userId) : userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("lojas").insertOne(newLoja)
      return NextResponse.json({ ...newLoja, _id: result.insertedId })
    }
  } catch (error) {
    console.error("Erro ao salvar loja:", error)
    return NextResponse.json({ error: "Erro ao salvar loja" }, { status: 500 })
  }
}

