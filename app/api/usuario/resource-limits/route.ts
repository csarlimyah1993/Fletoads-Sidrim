import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserResourceLimits } from "@/lib/plan-limits"
import PanfletoModel from "@/lib/models/panfleto" // Import as default
import ProdutoModel from "@/lib/models/produto" // Import as default

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
    const panfletosCount = await PanfletoModel.countDocuments({ usuario: userId })
    const produtosCount = await ProdutoModel.countDocuments({ usuario: userId })

    // Buscar limites de recursos
    const resourceLimits = await getUserResourceLimits(userId)

    // Atualizar o uso real
    if (resourceLimits.usage && resourceLimits.usage.panfletos) {
      resourceLimits.usage.panfletos.current = panfletosCount
      resourceLimits.usage.panfletos.percentage =
        resourceLimits.usage.panfletos.limit !== null
          ? Math.min((panfletosCount / resourceLimits.usage.panfletos.limit) * 100, 100)
          : 0
      resourceLimits.usage.panfletos.hasReached =
        resourceLimits.usage.panfletos.limit !== null && panfletosCount >= resourceLimits.usage.panfletos.limit
    }

    if (resourceLimits.usage && resourceLimits.usage.produtos) {
      resourceLimits.usage.produtos.current = produtosCount
      resourceLimits.usage.produtos.percentage =
        resourceLimits.usage.produtos.limit !== null
          ? Math.min((produtosCount / resourceLimits.usage.produtos.limit) * 100, 100)
          : 0
      resourceLimits.usage.produtos.hasReached =
        resourceLimits.usage.produtos.limit !== null && produtosCount >= resourceLimits.usage.produtos.limit
    }

    return NextResponse.json(resourceLimits)
  } catch (error) {
    console.error("Error fetching resource limits:", error)
    return NextResponse.json({ error: "Erro ao buscar limites de recursos" }, { status: 500 })
  }
}
