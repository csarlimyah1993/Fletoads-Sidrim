import { type NextRequest, NextResponse } from "next/server"
import Notificacao from "@/lib/models/notificacao"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

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

    // Verificar se o ID do usuário é um ObjectId válido
    const query: any = {}

    if (session.user.id) {
      // Verificar se o ID é um ObjectId válido
      if (mongoose.Types.ObjectId.isValid(session.user.id)) {
        query.usuario = session.user.id
      } else {
        // Se não for um ObjectId válido, podemos usar uma condição que nunca será verdadeira
        // para usuários com IDs especiais como "admin-id"
        // Ou podemos criar uma lógica especial para administradores
        if (session.user.id === "admin-id") {
          // Para admin, podemos retornar todas as notificações ou um conjunto específico
          // Aqui, optamos por retornar um array vazio de notificações
          return NextResponse.json({
            notificacoes: [],
            naoLidas: 0,
            pagination: {
              total: 0,
              page,
              limit,
              pages: 0,
            },
          })
        } else {
          // Para outros IDs não válidos, usamos uma condição que nunca será verdadeira
          query.usuario = new mongoose.Types.ObjectId("000000000000000000000000")
        }
      }
    }

    if (lida !== null) {
      query.lida = lida === "true"
    }

    const skip = (page - 1) * limit

    const notificacoes = await Notificacao.find(query).sort({ dataCriacao: -1 }).skip(skip).limit(limit)

    const total = await Notificacao.countDocuments(query)
    const naoLidas = await Notificacao.countDocuments({
      ...query,
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

    // Verificar se o ID do usuário é um ObjectId válido
    let usuarioId = session.user.id

    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      // Se não for um ObjectId válido, podemos usar um ID padrão ou gerar um novo
      // Aqui, optamos por não criar a notificação para usuários com IDs especiais
      if (usuarioId === "admin-id") {
        return NextResponse.json({ message: "Notificações não são criadas para admin" }, { status: 200 })
      } else {
        // Para outros IDs não válidos, podemos gerar um novo ObjectId
        usuarioId = new mongoose.Types.ObjectId().toString()
      }
    }

    const novaNotificacao = new Notificacao({
      ...body,
      usuario: usuarioId,
    })

    await novaNotificacao.save()

    return NextResponse.json(novaNotificacao, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 })
  }
}

