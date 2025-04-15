import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { MongoClient } from "mongodb"

import { authOptions } from "@/lib/auth"

const MONGODB_URI = process.env.MONGODB_URI || ""

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI)
    const dbName = MONGODB_URI.split("/").pop()?.split("?")[0] || "prod-db"
    const db = client.db(dbName)
    return { client, db }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

export async function GET() {
  try {
    // Verificar autenticação e autorização
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // Conectar ao banco de dados
    const { client, db } = await connectToDatabase()

    try {
      // Buscar produtos
      const produtos = await db.collection("produtos").find({}).sort({ createdAt: -1 }).limit(100).toArray()

      return NextResponse.json({ produtos })
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}
