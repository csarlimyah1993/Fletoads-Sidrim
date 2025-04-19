import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import PanfletoModel from "@/lib/models/panfleto"
import ProdutoModel from "@/lib/models/produto"
import mongoose from "mongoose"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    const userId = session.user.id

    // Create or get the Venda model directly
    const Venda =
      mongoose.models.Venda ||
      mongoose.model(
        "Venda",
        new mongoose.Schema({
          userId: String,
          dataVenda: Date,
          valorTotal: Number,
          cliente: mongoose.Schema.Types.Mixed,
          // Add other fields as needed
        }),
      )

    // Data atual e data de um mês atrás
    const hoje = new Date()
    const umMesAtras = new Date()
    umMesAtras.setMonth(hoje.getMonth() - 1)

    const doisMesesAtras = new Date()
    doisMesesAtras.setMonth(hoje.getMonth() - 2)

    // Buscar estatísticas atuais
    const [panfletosAtivos, produtosTotal, vendasMesAtual, clientesAlcancadosMesAtual] = await Promise.all([
      PanfletoModel.countDocuments({ userId, ativo: true }),
      ProdutoModel.countDocuments({ userId }),
      Venda.find({
        userId,
        dataVenda: { $gte: umMesAtras, $lte: hoje },
      }),
      Venda.distinct("cliente", {
        userId,
        dataVenda: { $gte: umMesAtras, $lte: hoje },
        cliente: { $exists: true, $ne: null },
      }),
    ])

    // Calcular vendas totais do mês atual
    const vendasTotais = vendasMesAtual.reduce((total, venda) => total + venda.valorTotal, 0)

    // Buscar estatísticas do mês anterior para comparação
    const [panfletosMesAnterior, produtosMesAnterior, vendasMesAnterior, clientesAlcancadosMesAnterior] =
      await Promise.all([
        PanfletoModel.countDocuments({
          userId,
          ativo: true,
          dataPublicacao: { $gte: doisMesesAtras, $lte: umMesAtras },
        }),
        ProdutoModel.countDocuments({
          userId,
          createdAt: { $gte: doisMesesAtras, $lte: umMesAtras },
        }),
        Venda.find({
          userId,
          dataVenda: { $gte: doisMesesAtras, $lte: umMesAtras },
        }),
        Venda.distinct("cliente", {
          userId,
          dataVenda: { $gte: doisMesesAtras, $lte: umMesAtras },
          cliente: { $exists: true, $ne: null },
        }),
      ])

    // Calcular vendas totais do mês anterior
    const vendasTotaisMesAnterior = vendasMesAnterior.reduce((total, venda) => total + venda.valorTotal, 0)

    // Calcular crescimento percentual
    const calcularCrescimento = (atual: number, anterior: number): number => {
      if (anterior === 0) return atual > 0 ? 100 : 0
      return Number((((atual - anterior) / anterior) * 100).toFixed(1))
    }

    const crescimentoVendas = calcularCrescimento(vendasTotais, vendasTotaisMesAnterior)
    const crescimentoPanfletos = calcularCrescimento(panfletosAtivos, panfletosMesAnterior)
    const crescimentoProdutos = calcularCrescimento(produtosTotal, produtosMesAnterior)
    const crescimentoClientes = calcularCrescimento(
      clientesAlcancadosMesAtual.length,
      clientesAlcancadosMesAnterior.length,
    )

    return NextResponse.json({
      vendasTotais,
      panfletosAtivos,
      produtosTotal,
      clientesAlcancados: clientesAlcancadosMesAtual.length,
      crescimentoVendas,
      crescimentoPanfletos,
      crescimentoProdutos,
      crescimentoClientes,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas do dashboard" }, { status: 500 })
  }
}
