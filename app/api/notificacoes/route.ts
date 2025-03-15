import { type NextRequest, NextResponse } from "next/server"
import Notificacao from "@/lib/models/notificacao"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const url = new URL(req.url)
    const lida = url.searchParams.get("lida")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    const query: any = { usuario: session.user.id }

    if (lida !== null) {
      query.lida = lida === "true"
    }

    const skip = (page - 1) * limit

    const notificacoes = await Notificacao.find(query).sort({ dataCriacao: -1 }).skip(skip).limit(limit)

    const total = await Notificacao.countDocuments(query)
    const naoLidas = await Notificacao.countDocuments({
      usuario: session.user.id,
      lida: false,
    })

    return NextResponse.json({
      notificacoes,
      naoLidas,
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

export async function POST(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    const novaNotificacao = new Notificacao({
      ...body,
      usuario: session.user.id,
    })

    await novaNotificacao.save()

    return NextResponse.json(novaNotificacao, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 })
  }
}

