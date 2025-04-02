import { NextResponse } from "next/server"
import { isConnected } from "@/lib/mongodb"

export async function GET() {
  try {
    const connected = await isConnected()

    if (!connected) {
      return NextResponse.json(
        { success: false, message: "Não foi possível conectar ao banco de dados" },
        { status: 503 },
      )
    }

    return NextResponse.json({ success: true, message: "Conexão com o banco de dados estabelecida" })
  } catch (error) {
    console.error("Erro ao verificar conexão com o banco de dados:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao verificar conexão com o banco de dados" },
      { status: 500 },
    )
  }
}

