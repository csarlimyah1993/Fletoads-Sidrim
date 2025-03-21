import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar dados de visualizações e cliques dos panfletos
    const panfletos = await db.collection("panfletos").find({ userId: session.user.id }).toArray()

    // Buscar dados de vendas
    const vendas = await db.collection("vendas").find({ userId: session.user.id }).sort({ date: -1 }).limit(5).toArray()

    // Calcular totais
    const totalViews = panfletos.reduce((sum, panfleto) => sum + (panfleto.views || 0), 0)
    const totalClicks = panfletos.reduce((sum, panfleto) => sum + (panfleto.clicks || 0), 0)
    const totalSales = vendas.reduce((sum, venda) => sum + (venda.amount || 0), 0)

    // Calcular taxa de conversão
    const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

    // Gerar dados para os gráficos
    const viewsData = generateChartData(panfletos, "views")
    const clicksData = generateChartData(panfletos, "clicks")

    // Formatar vendas recentes
    const recentSales = vendas.map((venda) => ({
      id: venda._id.toString(),
      customer: venda.customer,
      amount: venda.amount,
      status: venda.status,
      date: new Date(venda.date).toLocaleDateString("pt-BR"),
    }))

    return NextResponse.json({
      totalViews,
      totalClicks,
      totalSales,
      conversionRate,
      viewsData,
      clicksData,
      recentSales,
    })
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)
    return NextResponse.json({ error: "Erro ao buscar dados do dashboard" }, { status: 500 })
  }
}

// Função auxiliar para gerar dados para os gráficos
function generateChartData(panfletos: any[], field: string) {
  // Gerar dados dos últimos 7 dias
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const today = new Date()
  const dayOfWeek = today.getDay()

  return days.map((day, index) => {
    // Calcular o dia da semana relativo a hoje
    const relativeDay = (index - dayOfWeek + 7) % 7

    // Valor aleatório para demonstração (em produção, usaria dados reais)
    const total = Math.floor(Math.random() * 100) + 10

    return {
      name: day,
      total,
    }
  })
}

