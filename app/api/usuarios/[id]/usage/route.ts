import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"
import { getAllResourceLimits } from "@/lib/plan-limits"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = params.id

    // Verificar se o usuário está tentando acessar seus próprios dados ou se é admin
    if (session.user.id !== userId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar todos os limites de recursos
    const resourceLimits = await getAllResourceLimits(userId)

    return NextResponse.json(resourceLimits)
  } catch (error) {
    console.error("Erro ao buscar uso de recursos:", error)
    return NextResponse.json({ error: "Erro ao buscar uso de recursos" }, { status: 500 })
  }
}
