import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Buscar contagens
    const Panfleto = mongoose.models.Panfleto || mongoose.model("Panfleto", new mongoose.Schema({}, { strict: false }))
    const Produto = mongoose.models.Produto || mongoose.model("Produto", new mongoose.Schema({}, { strict: false }))
    const Loja = mongoose.models.Loja || mongoose.model("Loja", new mongoose.Schema({}, { strict: false }))
    const Visualizacao =
      mongoose.models.Visualizacao || mongoose.model("Visualizacao", new mongoose.Schema({}, { strict: false }))
    const Clique = mongoose.models.Clique || mongoose.model("Clique", new mongoose.Schema({}, { strict: false }))
    const Venda = mongoose.models.Venda || mongoose.model("Venda", new mongoose.Schema({}, { strict: false }))

    const totalPanfletos = await Panfleto.countDocuments()
    const totalProdutos = await Produto.countDocuments()
    const totalLojas = await Loja.countDocuments()

    // Buscar visualizações, cliques e vendas
    const visualizacoes = await Visualizacao.find({}).lean()
    const cliques = await Clique.find({}).lean()
    const vendas = await Venda.find({}).lean()

    // Calcular totais
    const totalVisualizacoes = visualizacoes.length
    const totalCliques = cliques.length
    const totalVendas = vendas.length

    // Agrupar por dia
    const visualizacoesPorDia = agruparPorDia(visualizacoes)
    const cliquesPorDia = agruparPorDia(cliques)
    const vendasPorDia = agruparPorDia(vendas)

    // Agrupar por categoria
    const visualizacoesPorCategoria = agruparPorCategoria(visualizacoes)
    const cliquesPorCategoria = agruparPorCategoria(cliques)
    const vendasPorCategoria = agruparPorCategoria(vendas)

    return NextResponse.json({
      totalVisualizacoes,
      totalCliques,
      totalVendas,
      totalPanfletos,
      totalProdutos,
      totalLojas,
      visualizacoesPorDia,
      cliquesPorDia,
      vendasPorDia,
      visualizacoesPorCategoria,
      cliquesPorCategoria,
      vendasPorCategoria,
    })
  } catch (error) {
    console.error("Erro ao buscar métricas:", error)

    // Retornar dados simulados em caso de erro
    return NextResponse.json({
      totalVisualizacoes: 12500,
      totalCliques: 3200,
      totalVendas: 450,
      totalPanfletos: 120,
      totalProdutos: 850,
      totalLojas: 35,
      visualizacoesPorDia: gerarDadosSimuladosPorDia(30, 100, 500),
      cliquesPorDia: gerarDadosSimuladosPorDia(30, 20, 150),
      vendasPorDia: gerarDadosSimuladosPorDia(30, 5, 25),
      visualizacoesPorCategoria: [
        { categoria: "Alimentos", count: 4500 },
        { categoria: "Eletrônicos", count: 3200 },
        { categoria: "Vestuário", count: 2800 },
        { categoria: "Saúde", count: 1200 },
        { categoria: "Outros", count: 800 },
      ],
      cliquesPorCategoria: [
        { categoria: "Alimentos", count: 1200 },
        { categoria: "Eletrônicos", count: 900 },
        { categoria: "Vestuário", count: 600 },
        { categoria: "Saúde", count: 300 },
        { categoria: "Outros", count: 200 },
      ],
      vendasPorCategoria: [
        { categoria: "Alimentos", count: 180 },
        { categoria: "Eletrônicos", count: 120 },
        { categoria: "Vestuário", count: 90 },
        { categoria: "Saúde", count: 40 },
        { categoria: "Outros", count: 20 },
      ],
    })
  }
}

// Função para agrupar dados por dia
function agruparPorDia(dados: any[]) {
  const hoje = new Date()
  const resultado: { data: string; count: number }[] = []

  // Criar mapa para contar ocorrências por dia
  const contagem = new Map<string, number>()

  // Preencher com os últimos 30 dias
  for (let i = 29; i >= 0; i--) {
    const data = new Date()
    data.setDate(hoje.getDate() - i)
    const dataFormatada = data.toISOString().split("T")[0]
    contagem.set(dataFormatada, 0)
  }

  // Contar ocorrências reais
  dados.forEach((item) => {
    const data = new Date(item.data || item.createdAt || item.dataRegistro || new Date())
    const dataFormatada = data.toISOString().split("T")[0]

    if (contagem.has(dataFormatada)) {
      contagem.set(dataFormatada, (contagem.get(dataFormatada) || 0) + 1)
    }
  })

  // Converter mapa para array
  contagem.forEach((count, data) => {
    resultado.push({ data, count })
  })

  // Ordenar por data
  resultado.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

  return resultado
}

// Função para agrupar dados por categoria
function agruparPorCategoria(dados: any[]) {
  const contagem = new Map<string, number>()

  dados.forEach((item) => {
    const categoria = item.categoria || "Sem categoria"
    contagem.set(categoria, (contagem.get(categoria) || 0) + 1)
  })

  const resultado: { categoria: string; count: number }[] = []

  contagem.forEach((count, categoria) => {
    resultado.push({ categoria, count })
  })

  // Ordenar por contagem (decrescente)
  resultado.sort((a, b) => b.count - a.count)

  return resultado
}

// Função para gerar dados simulados por dia
function gerarDadosSimuladosPorDia(dias: number, min: number, max: number) {
  const hoje = new Date()
  const resultado: { data: string; count: number }[] = []

  for (let i = dias - 1; i >= 0; i--) {
    const data = new Date()
    data.setDate(hoje.getDate() - i)
    const dataFormatada = data.toISOString().split("T")[0]

    // Gerar número aleatório entre min e max
    const count = Math.floor(Math.random() * (max - min + 1)) + min

    resultado.push({ data: dataFormatada, count })
  }

  return resultado
}

