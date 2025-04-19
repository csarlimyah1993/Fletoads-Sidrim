import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Notificacao from "@/lib/models/notificacao"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    try {
      await connectToDatabase()

      // Buscar notificações do usuário
      const notificacoes = await Notificacao.find({ usuarioId: userId })
        .sort({ dataCriacao: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      // Contar notificações não lidas
      const naoLidas = await Notificacao.countDocuments({
        usuarioId: userId,
        lida: false,
      })

      return NextResponse.json({ notificacoes, naoLidas })
    } catch (dbError) {
      console.error("Erro ao conectar ao banco de dados:", dbError)

      // Retornar dados fictícios quando o banco de dados está indisponível
      return NextResponse.json({
        notificacoes: [],
        naoLidas: 0,
        offline: true,
      })
    }
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 })
  }
}

