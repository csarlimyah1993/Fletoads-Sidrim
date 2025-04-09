import { NextResponse } from "next/server"
import { initLojaVitrine } from "@/scripts/init-loja-vitrine"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Verificar se o usuário é admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = params.userId

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 })
    }

    const result = await initLojaVitrine(userId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro ao inicializar loja e vitrine:", error)
    return NextResponse.json({ error: "Erro ao inicializar loja e vitrine" }, { status: 500 })
  }
}
