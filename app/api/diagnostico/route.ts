import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Usuario from "@/lib/models/usuario"
import Loja from "@/lib/models/loja"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar dados do usuário
    const usuario = await Usuario.findById(session.user.id).select("-senha")

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar dados da loja
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    // Retornar os dados encontrados
    return NextResponse.json({
      mensagem: "Diagnóstico concluído com sucesso",
      timestamp: new Date().toISOString(),
      conexao: "Conectado ao MongoDB com sucesso",
      dados: {
        usuario: usuario,
        loja: loja || "Loja não encontrada para este usuário",
      },
    })
  } catch (error) {
    console.error("Erro ao executar diagnóstico:", error)
    return NextResponse.json(
      {
        error: "Erro ao executar diagnóstico",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : null) : null,
      },
      { status: 500 },
    )
  }
}

