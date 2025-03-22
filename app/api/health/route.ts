import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/mongodb"

export async function GET() {
  try {
    // Verificar a conexão com o banco de dados
    const isDbConnected = await checkDatabaseConnection()

    if (!isDbConnected) {
      return NextResponse.json(
        {
          status: "error",
          message: "Não foi possível conectar ao banco de dados",
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
      },
      { status: 500 },
    )
  }
}

