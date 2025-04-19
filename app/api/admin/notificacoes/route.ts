import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import mongoose from "mongoose"

// Verificar se o modelo já existe para evitar erros
const Notificacao = mongoose.models.Notificacao

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Obter parâmetros de consulta
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const tipo = url.searchParams.get("tipo")
    const search = url.searchParams.get("search")

    // Construir consulta
    const query: any = {}
    if (tipo) {
      query.tipo = tipo
    }

    if (search) {
      query.$or = [{ titulo: { $regex: search, $options: "i" } }, { mensagem: { $regex: search, $options: "i" } }]
    }

    const skip = (page - 1) * limit

    // Buscar notificações
    const notificacoes = await Notificacao.find(query)
      .sort({ dataCriacao: -1 })
      .skip(skip)
      .limit(limit)
      .populate("usuario", "nome email")

    const total = await Notificacao.countDocuments(query)

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
    return NextResponse.json(
      {
        error: "Erro ao buscar notificações",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

