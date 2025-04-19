import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: integracaoId } = await context.params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id
    const { status } = await req.json()

    if (!integracaoId) {
      return NextResponse.json({ error: "ID da integração não fornecido" }, { status: 400 })
    }

    if (!["ativa", "inativa"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    // Criar filtro com ObjectId se aplicável
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter.userId = new ObjectId(userId)
    } else {
      userFilter.userId = userId
    }

    // Create a query filter based on whether integracaoId is a valid ObjectId
    let integracaoFilter: Record<string, any> = {}

    if (ObjectId.isValid(integracaoId)) {
      integracaoFilter._id = new ObjectId(integracaoId)
    } else {
      // If not a valid ObjectId, try to find by other fields
      integracaoFilter = {
        $or: [{ slug: integracaoId }, { codigo: integracaoId }, { identificador: integracaoId }],
      }
    }

    // Verificar se a integração existe
    const integracaoDisponivel = await db.collection("integracoes_disponiveis").findOne(integracaoFilter)

    if (!integracaoDisponivel) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Use the actual _id from the found integration
    const integracaoObjectId = integracaoDisponivel._id

    // Verificar se o usuário já tem essa integração
    const userIntegracao = await db.collection("integracoes").findOne({
      ...userFilter,
      integracaoId: integracaoObjectId,
    })

    if (userIntegracao) {
      // Atualizar integração existente
      await db.collection("integracoes").updateOne(
        {
          ...userFilter,
          integracaoId: integracaoObjectId,
        },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
      )
    } else {
      // Criar nova integração para o usuário
      await db.collection("integracoes").insertOne({
        userId: userFilter.userId,
        integracaoId: integracaoObjectId,
        status,
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("Erro ao atualizar status da integração:", error)
    return NextResponse.json({ error: "Erro ao atualizar status da integração" }, { status: 500 })
  }
}
