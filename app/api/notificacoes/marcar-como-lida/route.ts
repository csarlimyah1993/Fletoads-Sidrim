import { type NextRequest, NextResponse } from "next/server"
import Notificacao from "@/lib/models/notificacao"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { ids, todas = false } = body

    if (todas) {
      // Marcar todas as notificações como lidas
      await Notificacao.updateMany({ usuario: session.user.id, lida: false }, { $set: { lida: true } })
    } else if (ids && ids.length > 0) {
      // Marcar notificações específicas como lidas
      await Notificacao.updateMany(
        {
          _id: { $in: ids },
          usuario: session.user.id,
        },
        { $set: { lida: true } },
      )
    } else {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    return NextResponse.json({ message: "Notificações marcadas como lidas com sucesso" })
  } catch (error) {
    console.error("Erro ao marcar notificações como lidas:", error)
    return NextResponse.json({ error: "Erro ao marcar notificações como lidas" }, { status: 500 })
  }
}

