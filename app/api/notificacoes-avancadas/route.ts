import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import NotificacaoAvancada from "@/lib/models/notificacao-avancada"
import { authOptions } from "../../../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const tipo = searchParams.get("tipo")
    const origem = searchParams.get("origem")
    const lidas = searchParams.get("lidas")

    await connectToDatabase()

    // Construir query
    const query: any = { usuarioId: session.user.id }

    if (tipo) {
      query.tipo = tipo
    }

    if (origem) {
      query.origem = origem
    }

    if (lidas !== null) {
      query.lida = lidas === "true"
    }

    // Adicionar filtro de data de expiração
    query.$or = [{ dataExpiracao: { $exists: false } }, { dataExpiracao: null }, { dataExpiracao: { $gt: new Date() } }]

    // Contar total de notificações
    const total = await NotificacaoAvancada.countDocuments(query)

    // Buscar notificações com paginação
    const notificacoes = await NotificacaoAvancada.find(query)
      .sort({ dataCriacao: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Contar notificações não lidas
    const naoLidas = await NotificacaoAvancada.countDocuments({
      usuarioId: session.user.id,
      lida: false,
      $or: [{ dataExpiracao: { $exists: false } }, { dataExpiracao: null }, { dataExpiracao: { $gt: new Date() } }],
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { usuarioId, titulo, mensagem, tipo, link, icone, dataExpiracao, origem, referenciaId, acoes } = data

    if (!usuarioId || !titulo || !mensagem) {
      return NextResponse.json({ error: "Usuário, título e mensagem são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Criar nova notificação
    const novaNotificacao = new NotificacaoAvancada({
      usuarioId,
      titulo,
      mensagem,
      tipo: tipo || "info",
      link,
      icone,
      dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : undefined,
      origem: origem || "sistema",
      referenciaId,
      acoes,
      dataCriacao: new Date(),
    })

    await novaNotificacao.save()

    return NextResponse.json({
      message: "Notificação criada com sucesso",
      notificacao: novaNotificacao,
    })
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 })
  }
}

