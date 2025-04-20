import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
// Remove the Loja import since it's just a type
import Venda from "@/lib/models/venda"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Use the MongoDB collection directly instead of the Loja model
    const loja = await db.collection("lojas").findOne({
      $or: [
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const lojaId = loja._id.toString()

    // Estatísticas de vendas
    const totalVendas = await Venda.countDocuments({ lojaId })
    const vendasHoje = await Venda.countDocuments({
      lojaId,
      dataVenda: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })

    // Valor total de vendas
    const resultado = await Venda.aggregate([
      { $match: { lojaId } },
      { $group: { _id: null, total: { $sum: "$valorTotal" } } },
    ])

    const valorTotalVendas = resultado.length > 0 ? resultado[0].total : 0

    // Produtos mais vendidos
    const produtosMaisVendidos = await Venda.aggregate([
      { $match: { lojaId } },
      { $unwind: "$itens" },
      {
        $group: {
          _id: "$itens.produto.nome",
          quantidade: { $sum: "$itens.quantidade" },
          valor: { $sum: "$itens.produto.preco" },
        },
      },
      { $sort: { quantidade: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, nome: "$_id", quantidade: 1, valor: 1 } },
    ])

    // Vendas por período
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const vendasMes = await Venda.countDocuments({
      lojaId,
      dataVenda: { $gte: inicioMes },
    })

    // Vendas por status
    const vendasPorStatus = await Venda.aggregate([
      { $match: { lojaId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ])

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
