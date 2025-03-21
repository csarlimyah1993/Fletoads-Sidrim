import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id
    const notificationId = params.id

    if (!notificationId) {
      return NextResponse.json({ error: "ID da notificação não fornecido" }, { status: 400 })
    }

    // Verificar se a notificação existe e pertence ao usuário
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter.userId = new ObjectId(userId)
    } else {
      userFilter.userId = userId
    }

    const notification = await db.collection("notifications").findOne({
      _id: ObjectId.isValid(notificationId) ? new ObjectId(notificationId) : notificationId,
      ...userFilter,
    } as any)

    if (!notification) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    // Marcar como lida
    await db.collection("notifications").updateOne(
      {
        _id: ObjectId.isValid(notificationId) ? new ObjectId(notificationId) : notificationId,
        ...userFilter,
      } as any,
      {
        $set: {
          read: true,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro ao marcar notificação como lida" }, { status: 500 })
  }
}

