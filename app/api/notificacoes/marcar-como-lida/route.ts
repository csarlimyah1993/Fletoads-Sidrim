import { type NextRequest, NextResponse } from "next/server"
import Notificacao from "@/lib/models/notificacao"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function POST(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id, todas = false } = await req.json()

    // Verificar se o ID do usuário é um ObjectId válido
    const query: any = {}

    if (session.user.id) {
      // Verificar se o ID é um ObjectId válido
      if (mongoose.Types.ObjectId.isValid(session.user.id)) {
        query.usuario = session.user.id
      } else {
        // Se não for um ObjectId válido, podemos usar uma condição que nunca será verdadeira
        // para usuários com IDs especiais como "admin-id"
        if (session.user.id === "admin-id") {
          // Para admin, retornamos sucesso sem fazer alterações
          return NextResponse.json({ success: true })
        } else {
          // Para outros IDs não válidos, usamos uma condição que nunca será verdadeira
          query.usuario = new mongoose.Types.ObjectId("000000000000000000000000")
        }
      }
    }

    if (todas) {
      // Marcar todas as notificações como lidas
      await Notificacao.updateMany(query, { lida: true })
    } else if (id) {
      // Marcar uma notificação específica como lida
      query._id = id
      await Notificacao.findOneAndUpdate(query, { lida: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro ao marcar notificação como lida" }, { status: 500 })
  }
}

