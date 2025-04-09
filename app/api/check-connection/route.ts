import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Tentar conectar ao banco de dados
    const { client, db } = await connectToDatabase()

    // Verificar se a conexão está ativa
    let isConnected = false
    try {
      // Ping para verificar conexão
      await db.command({ ping: 1 })
      isConnected = true
    } catch (error) {
      isConnected = false
    }

    // Obter informações sobre as coleções
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((col) => col.name)

    // Contar documentos em algumas coleções principais
    const counts: Record<string, number | string> = {}
    for (const collection of ["usuarios", "lojas", "vitrines", "produtos"]) {
      if (collectionNames.includes(collection)) {
        counts[collection] = await db.collection(collection).countDocuments()
      } else {
        counts[collection] = "Coleção não existe"
      }
    }

    return NextResponse.json({
      connected: isConnected,
      details: {
        collections: collectionNames,
        counts,
        databaseName: db.databaseName,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar conexão com o banco de dados:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
