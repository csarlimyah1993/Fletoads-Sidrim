import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Panfleto from "@/lib/models/panfleto"
import Cliente from "@/lib/models/cliente"
import Campanha from "@/lib/models/campanha"
import VendaModel from "@/lib/models/venda" // Using default export
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Data de início para "último mês" (30 dias atrás)
    const ultimoMes = new Date()
    ultimoMes.setDate(ultimoMes.getDate() - 30)

    // Data de início para "mês anterior" (60 dias atrás)
    const mesAnterior = new Date()
    mesAnterior.setDate(mesAnterior.getDate() - 60)

    // Data atual
    const hoje = new Date()

    // Data de início para "últimos 6 meses"
    const dataInicio6Meses = new Date()
    dataInicio6Meses.setMonth(dataInicio6Meses.getMonth() - 6)

    // Estatísticas de Panfletos
    const totalPanfletos = await Panfleto.countDocuments({ usuarioId: userId })
    const panfletosAtivos = await Panfleto.countDocuments({ usuarioId: userId, ativo: true })

    //Panfletos por categoria
    const panfletosPorCategoria = await Panfleto.aggregate([
      { $match: { usuarioId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$categoria", quantidade: { $sum: 1 } } },
      { $project: { categoria: "$_id", quantidade: 1, _id: 0 } },
      { $sort: { quantidade: -1 } },
    ])

    // Panfletos por mês (últimos 6 meses)
    const panfletosPorMes = await Panfleto.aggregate([
      {
        $match: {
          usuarioId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: dataInicio6Meses },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          quantidade: { $sum: 1 },
        },
      },
      {
        $project: {
          mes: { $concat: [{ $toString: "$_id.year" }, "-", { $toString: "$_id.month" }] },
          quantidade: 1,
          _id: 0,
        },
      },
      { $sort: { mes: 1 } },
    ])

    // Crescimento de panfletos
    const panfletosUltimoMes = await Panfleto.countDocuments({
      usuarioId: userId,
      createdAt: { $gte: ultimoMes },
    })

    const panfletosMesAnterior = await Panfleto.countDocuments({
      usuarioId: userId,
      createdAt: { $gte: mesAnterior, $lt: ultimoMes },
    })

    const crescimentoPanfletos =
      panfletosMesAnterior > 0 ? ((panfletosUltimoMes - panfletosMesAnterior) / panfletosMesAnterior) * 100 : 0

    // Estatísticas de Clientes
    const totalClientes = await Cliente.countDocuments({ usuarioId: userId })

    const clientesAtivos = await Cliente.countDocuments({
      usuarioId: userId,
      ativo: true,
    })

    // Clientes por segmento
    const clientesPorSegmento = await Cliente.aggregate([
      { $match: { usuarioId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$segmento", quantidade: { $sum: 1 } } },
      { $project: { segmento: { $ifNull: ["$_id", "Não categorizado"] }, quantidade: 1, _id: 0 } },
      { $sort: { quantidade: -1 } },
    ])

    // Crescimento de clientes
    const clientesUltimoMes = await Cliente.countDocuments({
      usuarioId: userId,
      createdAt: { $gte: ultimoMes },
    })

    const clientesMesAnterior = await Cliente.countDocuments({
      usuarioId: userId,
      createdAt: { $gte: mesAnterior, $lt: ultimoMes },
    })

    const crescimentoClientes =
      clientesMesAnterior > 0 ? ((clientesUltimoMes - clientesMesAnterior) / clientesMesAnterior) * 100 : 0

    // Estatísticas de Campanhas
    const totalCampanhas = await Campanha.countDocuments({ usuarioId: userId })

    const campanhasAtivas = await Campanha.countDocuments({
      usuarioId: userId,
      status: "ativa",
    })

    // Campanhas por status
    const campanhasPorStatus = await Campanha.aggregate([
      { $match: { usuarioId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", quantidade: { $sum: 1 } } },
      { $project: { status: { $ifNull: ["$_id", "Não definido"] }, quantidade: 1, _id: 0 } },
      { $sort: { quantidade: -1 } },
    ])

    // Crescimento de campanhas
    const campanhasUltimoMes = await Campanha.countDocuments({
      usuarioId: userId,
      createdAt: { $gte: ultimoMes },
    })

    const campanhasMesAnterior = await Campanha.countDocuments({
      usuarioId: userId,
      createdAt: { $gte: mesAnterior, $lt: ultimoMes },
    })

    const crescimentoCampanhas =
      campanhasMesAnterior > 0 ? ((campanhasUltimoMes - campanhasMesAnterior) / campanhasMesAnterior) * 100 : 0

    // Estatísticas de Vendas
    const vendasMesAtual = await VendaModel.find({
      userId,
      data: { $gte: ultimoMes, $lte: hoje },
    })

    const clientesAlcancadosMesAtual = await VendaModel.distinct("cliente", {
      userId,
      data: { $gte: ultimoMes, $lte: hoje },
      cliente: { $exists: true, $ne: null },
    })

    // Calcular vendas totais do mês atual
    const vendasTotais = vendasMesAtual.reduce((total, venda) => total + venda.valor, 0)

    // Buscar estatísticas do mês anterior para comparação
    const vendasMesAnterior = await VendaModel.find({
      userId,
      data: { $gte: mesAnterior, $lt: ultimoMes },
    })

    const clientesAlcancadosMesAnterior = await VendaModel.distinct("cliente", {
      userId,
      data: { $gte: mesAnterior, $lt: ultimoMes },
      cliente: { $exists: true, $ne: null },
    })

    // Calcular vendas totais do mês anterior
    const vendasTotaisMesAnterior = vendasMesAnterior.reduce((total, venda) => total + venda.valor, 0)

    // Calcular crescimento percentual
    const calcularCrescimento = (atual: number, anterior: number): number => {
      if (anterior === 0) return atual > 0 ? 100 : 0
      return Number((((atual - anterior) / anterior) * 100).toFixed(1))
    }

    const crescimentoVendas = calcularCrescimento(vendasTotais, vendasTotaisMesAnterior)

    // Taxa de conversão (estimativa)
    const visualizacoesEstimadas = totalPanfletos * 100 // Estimativa simples
    const taxaConversao = visualizacoesEstimadas > 0 ? (vendasMesAtual.length / visualizacoesEstimadas) * 100 : 0

    // Crescimento da taxa de conversão (estimativa)
    const taxaConversaoAnterior =
      visualizacoesEstimadas > 0 ? (vendasMesAnterior.length / visualizacoesEstimadas) * 100 : 0

    const crescimentoConversao =
      taxaConversaoAnterior > 0 ? ((taxaConversao - taxaConversaoAnterior) / taxaConversaoAnterior) * 100 : 0

    // Montar o objeto de resposta combinando ambas as estruturas
    const estatisticas = {
      // Formato da sua resposta original
      vendasTotais,
      panfletosAtivos,
      produtosTotal: await Panfleto.countDocuments({ usuarioId: userId }),
      clientesAlcancados: clientesAlcancadosMesAtual.length,
      crescimentoVendas,
      crescimentoPanfletos,
      crescimentoProdutos: calcularCrescimento(
        await Panfleto.countDocuments({ usuarioId: userId, createdAt: { $gte: ultimoMes } }),
        await Panfleto.countDocuments({ usuarioId: userId, createdAt: { $gte: mesAnterior, $lt: ultimoMes } }),
      ),
      crescimentoClientes,

      // Formato detalhado
      detalhado: {
        panfletos: {
          total: totalPanfletos,
          ativos: panfletosAtivos,
          porCategoria: panfletosPorCategoria,
          porMes: panfletosPorMes,
          crescimento: Math.round(crescimentoPanfletos),
        },
        clientes: {
          total: totalClientes,
          ativos: clientesAtivos,
          porSegmento: clientesPorSegmento,
          crescimento: Math.round(crescimentoClientes),
        },
        campanhas: {
          total: totalCampanhas,
          ativas: campanhasAtivas,
          performance: campanhasPorStatus,
          crescimento: Math.round(crescimentoCampanhas),
        },
        vendas: {
          total: vendasMesAtual.length,
          valor: vendasTotais,
          crescimento: Math.round(crescimentoVendas),
        },
        geral: {
          taxaConversao: Number.parseFloat(taxaConversao.toFixed(2)),
          crescimentoConversao: Math.round(crescimentoConversao),
        },
      },
    }

    return NextResponse.json(estatisticas)
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
  }
}
