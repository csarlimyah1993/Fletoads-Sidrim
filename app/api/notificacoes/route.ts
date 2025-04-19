import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Notificacao from "@/lib/models/notificacao"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Conectar ao banco de dados antes de usar os modelos Mongoose
    await connectToDatabase()

    // Buscar notificações do usuário
    const notificacoes = await Notificacao.find({ usuarioId: userId }).sort({ dataCriacao: -1 }).skip(skip).limit(limit)

    // Contar total de notificações para paginação
    const total = await Notificacao.countDocuments({ usuarioId: userId })

    return NextResponse.json({
      notificacoes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 })
  }
}
