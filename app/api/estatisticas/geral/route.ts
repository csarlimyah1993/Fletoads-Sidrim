import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Panfleto from "@/lib/models/panfleto"
// Import other models as needed

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Conectar ao banco de dados antes de usar os modelos Mongoose
    await connectToDatabase()

    // Estatísticas de Panfletos
    const totalPanfletos = await Panfleto.countDocuments({ usuarioId: userId })
    const panfletosAtivos = await Panfleto.countDocuments({ usuarioId: userId, ativo: true })

    // Add other statistics as needed

    return NextResponse.json({
      panfletos: {
        total: totalPanfletos,
        ativos: panfletosAtivos,
      },
      // Other statistics
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
  }
}
