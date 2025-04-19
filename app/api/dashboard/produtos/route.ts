import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { MongoClient } from "mongodb"
import { authOptions } from "../../../../lib/auth"

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

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Conectar ao banco de dados
    const { client, db } = await connectToDatabase()

    try {
      // Buscar produtos do usuário logado usando userId ou usuarioId
      // Tentamos ambos os campos para garantir compatibilidade
      const produtos = await db
        .collection("produtos")
        .find({
          $or: [{ userId: userId }, { usuarioId: userId }],
        })
        .sort({ createdAt: -1 })
        .toArray()

      console.log(`Encontrados ${produtos.length} produtos para o usuário ${userId}`)

      return NextResponse.json({ produtos })
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}
