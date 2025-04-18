import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const integracao = await WhatsappIntegracao.findOne({
      _id: id,
      userId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    try {
      // Desconectar a instância
      const logoutResponse = await fetch(`${integracao.evolutionApiUrl}/instance/logout/${integracao.nomeInstancia}`, {
        method: "POST",
        headers: {
          apikey: integracao.apiKey,
        },
      })

      if (!logoutResponse.ok) {
        const errorData = await logoutResponse.json()
        return NextResponse.json({ error: "Erro ao desconectar", details: errorData }, { status: 500 })
      }

      // Atualizar status da integração
      await WhatsappIntegracao.findByIdAndUpdate(id, {
        $set: { status: "desconectado" },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Erro ao comunicar com Evolution API:", error)
      return NextResponse.json({ error: "Erro ao comunicar com Evolution API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao desconectar:", error)
    return NextResponse.json({ error: "Erro ao desconectar" }, { status: 500 })
  }
}
