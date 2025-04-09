import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import NotificacaoAvancada from "@/lib/models/notificacao-avancada"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id, todas } = await request.json()

    await connectToDatabase()

    if (todas) {
      // Marcar todas as notificações como lidas
      await NotificacaoAvancada.updateMany({ usuarioId: session.user.id, lida: false }, { $set: { lida: true } })

      return NextResponse.json({
        message: "Todas as notificações foram marcadas como lidas",
      })
    } else if (id) {
      // Marcar uma notificação específica como lida
      const notificacao = await NotificacaoAvancada.findOne({
        _id: id,
        usuarioId: session.user.id,
      })

      if (!notificacao) {
        return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
      }

      notificacao.lida = true
      await notificacao.save()

      return NextResponse.json({
        message: "Notificação marcada como lida",
        notificacao,
      })
    } else {
      return NextResponse.json({ error: "ID da notificação ou parâmetro 'todas' é obrigatório" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

