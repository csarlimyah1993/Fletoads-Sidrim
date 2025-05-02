import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar todas as participações
    const participacoes = await db.collection("participacoesEventos").find().toArray()

    // Enriquecer com dados de lojas e eventos
    const participacoesEnriquecidas = await Promise.all(
      participacoes.map(async (participacao) => {
        // Buscar dados da loja
        const loja = await db.collection("lojas").findOne({ _id: participacao.lojaId })

        // Buscar dados do evento
        const evento = await db.collection("eventos").findOne({ _id: participacao.eventoId })

        return {
          ...participacao,
          _id: participacao._id.toString(),
          lojaNome: loja?.nome || "Loja desconhecida",
          lojaLogo: loja?.logo || null,
          eventoNome: evento?.nome || "Evento desconhecido",
        }
      }),
    )

    return NextResponse.json({ participacoes: participacoesEnriquecidas })
  } catch (error) {
    console.error("Erro ao buscar participações:", error)
    return NextResponse.json({ error: "Erro ao buscar participações" }, { status: 500 })
  }
}
