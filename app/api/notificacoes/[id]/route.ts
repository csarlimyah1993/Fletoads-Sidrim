import { type NextRequest, NextResponse } from "next/server"
import Notificacao from "@/lib/models/notificacao"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await context.params // Acesso assíncrono ao parâmetro

    // Verificar se o ID do usuário é um ObjectId válido
    const query: any = { _id: id }

    if (session.user.id) {
      // Verificar se o ID é um ObjectId válido
      if (mongoose.Types.ObjectId.isValid(session.user.id)) {
        query.usuario = session.user.id
      } else {
        // Se não for um ObjectId válido, podemos usar uma condição que nunca será verdadeira
        // para usuários com IDs especiais como "admin-id"
        if (session.user.id === "admin-id") {
          // Para admin, não filtramos por usuário
          delete query.usuario
        } else {
          // Para outros IDs não válidos, usamos uma condição que nunca será verdadeira
          query.usuario = new mongoose.Types.ObjectId("000000000000000000000000")
        }
      }
    }

    const notificacao = await Notificacao.findOne(query)

    if (!notificacao) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(notificacao)
  } catch (error) {
    console.error("Erro ao buscar notificação:", error)
    return NextResponse.json({ error: "Erro ao buscar notificação" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await context.params // Acesso assíncrono ao parâmetro

    // Verificar se o ID do usuário é um ObjectId válido
    const query: any = { _id: id }

    if (session.user.id) {
      // Verificar se o ID é um ObjectId válido
      if (mongoose.Types.ObjectId.isValid(session.user.id)) {
        query.usuario = session.user.id
      } else {
        // Se não for um ObjectId válido, podemos usar uma condição que nunca será verdadeira
        // para usuários com IDs especiais como "admin-id"
        if (session.user.id === "admin-id") {
          // Para admin, não filtramos por usuário
          delete query.usuario
        } else {
          // Para outros IDs não válidos, usamos uma condição que nunca será verdadeira
          query.usuario = new mongoose.Types.ObjectId("000000000000000000000000")
        }
      }
    }

    const notificacao = await Notificacao.findOneAndDelete(query)

    if (!notificacao) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir notificação:", error)
    return NextResponse.json({ error: "Erro ao excluir notificação" }, { status: 500 })
  }
}
