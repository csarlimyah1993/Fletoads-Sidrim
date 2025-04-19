import { type NextRequest, NextResponse } from "next/server"
import Venda from "@/lib/models/venda"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"

export async function GET(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada para este usuário" }, { status: 404 })
    }

    const url = new URL(req.url)
    const periodo = url.searchParams.get("periodo") || "mes"

    // Definir datas de início e fim com base no período
    const dataAtual = new Date()
    const dataInicio = new Date()

    switch (periodo) {
      case "dia":
        dataInicio.setHours(0, 0, 0, 0)
        break
      case "semana":
        dataInicio.setDate(dataInicio.getDate() - 7)
        break
      case "mes":
        dataInicio.setMonth(dataInicio.getMonth() - 1)
        break
      case "ano":
        dataInicio.setFullYear(dataInicio.getFullYear() - 1)
        break
      default:
        dataInicio.setMonth(dataInicio.getMonth() - 1)
    }

    // Total de vendas no período
    const totalVendas = await Venda.countDocuments({
      lojaId: loja._id,
      dataVenda: { $gte: dataInicio, $lte: dataAtual },
      status: { $ne: "cancelado" },
    })

    // Valor total das vendas no período
    const valorAgregado = await Venda.aggregate([
      {
        $match: {
          lojaId: loja._id,
          dataVenda: { $gte: dataInicio, $lte: dataAtual },
          status: { $ne: "cancelado" },
        },
      },
      {
        $group: {
          _id: null,
          valorTotal: { $sum: "$valorTotal" },
        },
      },
    ])

    const valorTotal = valorAgregado.length > 0 ? valorAgregado[0].valorTotal : 0

    // Vendas por status
    const vendasPorStatus = await Venda.aggregate([
      {
        $match: {
          lojaId: loja._id,
          dataVenda: { $gte: dataInicio, $lte: dataAtual },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          valor: { $sum: "$valorTotal" },
        },
      },
    ])

    // Vendas por método de pagamento
    const vendasPorMetodoPagamento = await Venda.aggregate([
      {
        $match: {
          lojaId: loja._id,
          dataVenda: { $gte: dataInicio, $lte: dataAtual },
          status: { $ne: "cancelado" },
        },
      },
      {
        $group: {
          _id: "$metodoPagamento",
          count: { $sum: 1 },
          valor: { $sum: "$valorTotal" },
        },
      },
    ])

    // Vendas por dia (para gráfico)
    const vendasPorDia = await Venda.aggregate([
      {
        $match: {
          lojaId: loja._id,
          dataVenda: { $gte: dataInicio, $lte: dataAtual },
          status: { $ne: "cancelado" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dataVenda" } },
          count: { $sum: 1 },
          valor: { $sum: "$valorTotal" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    return NextResponse.json({
      periodo,
      totalVendas,
      valorTotal,
      vendasPorStatus,
      vendasPorMetodoPagamento,
      vendasPorDia,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas de vendas:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas de vendas" }, { status: 500 })
  }
}

