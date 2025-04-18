import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || (status !== "connected" && status !== "disconnected")) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    if (status === "connected") {
      // Conectar integração
      await db.collection("integracoes_usuario").updateOne(
        {
          userId: session.user.id,
          integracaoId: id,
        },
        {
          $set: {
            userId: session.user.id,
            integracaoId: id,
            connectedAt: new Date().toISOString(),
          },
        },
        { upsert: true },
      )
    } else {
      // Desconectar integração
      await db.collection("integracoes_usuario").deleteOne({
        userId: session.user.id,
        integracaoId: id,
      })
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("Erro ao atualizar integração:", error)
    return NextResponse.json({ error: "Erro ao atualizar integração" }, { status: 500 })
  }
}
