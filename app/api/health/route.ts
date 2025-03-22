import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Verificar a conexão com o banco de dados
    let isDbConnected = false
    let errorMessage = ""

    try {
      const { db } = await connectToDatabase()

      // Tentar uma operação simples para verificar se a conexão está funcionando
      const result = await db.command({ ping: 1 })
      isDbConnected = result.ok === 1
    } catch (dbError) {
      console.error("Erro ao conectar ao banco de dados:", dbError)
      errorMessage = dbError instanceof Error ? dbError.message : "Erro desconhecido"
      isDbConnected = false
    }

    if (!isDbConnected) {
      return NextResponse.json(
        {
          status: "error",
          message: "Não foi possível conectar ao banco de dados",
          error: errorMessage,
          services: {
            database: "down",
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      message: "Todos os serviços estão funcionando corretamente",
      services: {
        database: "up",
      },
    })
  } catch (error) {
    console.error("Erro ao verificar saúde da aplicação:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao verificar saúde da aplicação",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        services: {
          database: "unknown",
        },
      },
      { status: 500 },
    )
  }
}

