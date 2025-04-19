import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Falha ao conectar ao banco de dados")
    }

    // Buscar notificações do usuário
    const notificationsCollection = db.collection("notifications")

    // Verificar se a coleção existe
    const collections = await db.listCollections({ name: "notifications" }).toArray()

    // Se a coleção não existir, criar e retornar array vazio
    if (collections.length === 0) {
      await db.createCollection("notifications")
      return NextResponse.json({ notifications: [] })
    }

    const notifications = await notificationsCollection
      .find({ userId: session.user.id, read: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 })
  }
}

