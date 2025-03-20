import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserResourceLimits } from "@/lib/plan-limits"
import { Panfleto } from "@/lib/models/panfleto"
import { Produto } from "@/lib/models/produto"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Importar os modelos para garantir que estejam registrados
    const userId = session.user.id

    // Buscar contagens reais
    const panfletosCount = await Panfleto.countDocuments({ usuario: userId })
    const produtosCount = await Produto.countDocuments({ usuario: userId })

    // Buscar limites de recursos
    const resourceLimits = await getUserResourceLimits(userId)

    // Atualizar o uso real
    resourceLimits.usage = {
      ...resourceLimits.usage,
      panfletos: panfletosCount,
      produtos: produtosCount,
    }

    return NextResponse.json(resourceLimits)
  } catch (error) {
    console.error("Error fetching resource limits:", error)
    return NextResponse.json({ error: "Erro ao buscar limites de recursos" }, { status: 500 })
  }
}

