import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    // Criar um filtro adequado para o MongoDB
    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter.userId = new ObjectId(userId)
    } else {
      userFilter.userId = userId
    }

    // Buscar notificações do usuário
    const notificationsCollection = db.collection("notifications")

    // Verificar se a coleção existe
    const collections = await db.listCollections({ name: "notifications" }).toArray()

    let notifications = []

    if (collections.length > 0) {
      notifications = await notificationsCollection.find(userFilter).sort({ date: -1 }).limit(10).toArray()
    } else {
      // Se a coleção não existir, retornar notificações de exemplo
      notifications = [
        {
          id: "1",
          title: "Bem-vindo ao FletoAds",
          message: "Obrigado por se juntar à nossa plataforma!",
          date: new Date().toISOString(),
          read: false,
          type: "info",
          userId,
        },
        {
          id: "2",
          title: "Dica: Complete seu perfil",
          message: "Complete seu perfil para melhorar sua visibilidade.",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          type: "info",
          userId,
        },
      ]
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
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

    const notificationId = ObjectId.isValid(id) ? new ObjectId(id) : id

    const result = await db
      .collection("notifications")
      .updateOne({ _id: notificationId, ...userFilter }, { $set: { read: true } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro ao marcar notificação como lida" }, { status: 500 })
  }
}

