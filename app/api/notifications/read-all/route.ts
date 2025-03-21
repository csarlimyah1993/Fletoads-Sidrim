import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    const userFilter: Record<string, any> = {}

    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      userFilter.userId = new ObjectId(userId)
    } else {
      userFilter.userId = userId
    }

    const result = await db.collection("notifications").updateMany(userFilter, { $set: { read: true } })

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount })
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error)
    return NextResponse.json({ error: "Erro ao marcar todas as notificações como lidas" }, { status: 500 })
  }
}

