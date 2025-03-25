import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    console.log("Testando conexão com o MongoDB...")
    const startTime = Date.now()

    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Falha ao conectar ao banco de dados")
    }

    const connectionTime = Date.now() - startTime

    // Verificar o estado da conexão
    const connectionState = mongoose.connection.readyState
    const connectionStateText =
      connectionState === 0
        ? "desconectado"
        : connectionState === 1
          ? "conectado"
          : connectionState === 2
            ? "conectando"
            : connectionState === 3
              ? "desconectando"
              : "desconhecido"

    if (connectionState === 1) {
      // Testar uma operação simples
      const collections = await db.listCollections().toArray()

      return NextResponse.json({
        success: true,
        message: "Conexão com o MongoDB estabelecida com sucesso!",
        connectionTime: `${connectionTime}ms`,
        state: connectionStateText,
        collections: collections.map((c: any) => c.name),
        config: {
          connectTimeoutMS: mongoose.connection.config.connectTimeoutMS,
          socketTimeoutMS: mongoose.connection.config.socketTimeoutMS,
          serverSelectionTimeoutMS: mongoose.connection.config.serverSelectionTimeoutMS,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Falha ao conectar com o MongoDB. Estado: ${connectionStateText}`,
          connectionTime: `${connectionTime}ms`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao testar conexão com o MongoDB",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

