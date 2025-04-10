import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o usuário tem uma loja
    const loja = await db.collection("lojas").findOne({ proprietarioId: session.user.id })

    // Verificar se o usuário tem uma vitrine
    const vitrine = await db.collection("vitrines").findOne({ lojaId: loja?._id })

    return NextResponse.json({
      temLoja: !!loja,
      temVitrine: !!vitrine,
      vitrineId: vitrine?._id?.toString(),
      vitrineUrl: vitrine ? `/vitrines/${vitrine.slug}` : null,
      vitrineName: loja?.nome,
    })
  } catch (error) {
    console.error("Erro ao verificar loja e vitrine:", error)
    return NextResponse.json({ error: "Erro ao verificar loja e vitrine" }, { status: 500 })
  }
}
