import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obter o ID da notificação do corpo da requisição
    const data = await request.json()
    const { id } = data

    if (!id) {
      return NextResponse.json({ error: "ID da notificação não fornecido" }, { status: 400 })
    }

    const userId = session.user.id
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter.userId = new ObjectId(userId)
    } else {
      userFilter.userId = userId
    }

    // Tente converter para ObjectId se for válido
    let notificationId
    try {
      notificationId = ObjectId.isValid(id) ? new ObjectId(id) : id
    } catch (error) {
      notificationId = id
    }

    console.log("Marcando notificação como lida:", { notificationId, userFilter })

    const result = await db
      .collection("notifications")
      .updateOne({ _id: notificationId, ...userFilter }, { $set: { read: true } })

    console.log("Resultado da atualização:", result)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro ao marcar notificação como lida" }, { status: 500 })
  }
}

