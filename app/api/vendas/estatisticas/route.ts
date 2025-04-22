import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { db } = await connectToDatabase()

    // Obter o ID do usuário ativo
    const userId = session.user.id
    console.log("User ID:", userId)

    // Data atual
    const hoje = new Date()
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

    // Início do mês atual
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    // Consultas para estatísticas usando $or para comparar tanto string quanto ObjectId
    const totalVendas = await db.collection("vendas").countDocuments({
      $or: [{ usuarioId: userId }, { usuarioId: userId.toString() }],
    })

    console.log(`Vendas encontradas para usuarioId ${userId}: ${totalVendas}`)

    const vendasHoje = await db.collection("vendas").countDocuments({
      $or: [{ usuarioId: userId }, { usuarioId: userId.toString() }],
      dataCriacao: { $gte: inicioHoje },
    })

    const vendasMes = await db.collection("vendas").countDocuments({
      $or: [{ usuarioId: userId }, { usuarioId: userId.toString() }],
      dataCriacao: { $gte: inicioMes },
    })

    // Calcular valor total das vendas
    const resultadoValorTotal = await db
      .collection("vendas")
      .aggregate([
        {
          $match: {
            $or: [{ usuarioId: userId }, { usuarioId: userId.toString() }],
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])
      .toArray()

    const valorTotalVendas = resultadoValorTotal.length > 0 ? resultadoValorTotal[0].total : 0

    // Produtos mais vendidos - Simplificado para evitar erros
    const produtosMaisVendidos = await db
      .collection("vendas")
      .aggregate([
        {
          $match: {
            $or: [{ usuarioId: userId }, { usuarioId: userId.toString() }],
          },
        },
        { $unwind: "$itens" },
        {
          $group: {
            _id: "$itens.produtoId",
            quantidade: { $sum: "$itens.quantidade" },
            nomeProduto: { $first: "$itens.nome" },
            valor: { $sum: { $multiply: ["$itens.preco", "$itens.quantidade"] } },
          },
        },
        { $sort: { quantidade: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            nome: { $ifNull: ["$nomeProduto", "Produto não encontrado"] },
            quantidade: 1,
            valor: 1,
          },
        },
      ])
      .toArray()

    // Vendas por status
    const vendasPorStatus = await db
      .collection("vendas")
      .aggregate([
        {
          $match: {
            $or: [{ usuarioId: userId }, { usuarioId: userId.toString() }],
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { status: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ])
      .toArray()

    console.log("Estatísticas calculadas:", {
      totalVendas,
      vendasHoje,
      vendasMes,
      valorTotalVendas,
      produtosMaisVendidos: produtosMaisVendidos.length,
      vendasPorStatus: vendasPorStatus.length,
    })

    return NextResponse.json({
      totalVendas,
      vendasHoje,
      vendasMes,
      valorTotalVendas,
      produtosMaisVendidos,
      vendasPorStatus,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas de vendas:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas de vendas" }, { status: 500 })
  }
}
