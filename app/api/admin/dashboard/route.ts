import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    console.log("Iniciando rota de dashboard admin")
    await connectToDatabase()
    console.log("Conexão com MongoDB estabelecida")

    // Obter modelos
    const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", new mongoose.Schema({}, { strict: false }))
    const Loja = mongoose.models.Loja || mongoose.model("Loja", new mongoose.Schema({}, { strict: false }))
    const Produto = mongoose.models.Produto || mongoose.model("Produto", new mongoose.Schema({}, { strict: false }))
    const Panfleto = mongoose.models.Panfleto || mongoose.model("Panfleto", new mongoose.Schema({}, { strict: false }))
    const Venda = mongoose.models.Venda || mongoose.model("Venda", new mongoose.Schema({}, { strict: false }))

    console.log("Modelos carregados, iniciando consultas")

    // Get user stats
    const totalUsers = await Usuario.countDocuments()
    const activeUsers = await Usuario.countDocuments({ ativo: true })

    // Get store stats
    const totalStores = await Loja.countDocuments()

    // Get product stats
    const totalProducts = await Produto.countDocuments()

    // Get panfleto stats
    const totalPanfletos = await Panfleto.countDocuments()

    // Get sales stats
    const totalSales = await Venda.countDocuments()
    const salesAggregate = await Venda.aggregate([{ $group: { _id: null, total: { $sum: "$valor" } } }])
    const totalRevenue = salesAggregate.length > 0 ? salesAggregate[0].total : 0

    // Get users by plan
    const usersByPlanAggregate = await Usuario.aggregate([{ $group: { _id: "$plano", count: { $sum: 1 } } }])

    const usersByPlan = usersByPlanAggregate.map((item) => ({
      name: item._id || "Gratuito",
      value: item.count,
    }))

    // Get user registrations by month (last 12 months)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const userRegistrationByMonth = await Usuario.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const userRegistrationData = userRegistrationByMonth.map((item) => {
      const [year, month] = item._id.split("-")
      return {
        month: months[Number.parseInt(month) - 1],
        users: item.count,
      }
    })

    // Get sales by month (last 12 months)
    const salesByMonth = await Venda.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          sales: { $sum: "$valor" },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const salesByMonthData = salesByMonth.map((item) => {
      const [year, month] = item._id.split("-")
      return {
        month: months[Number.parseInt(month) - 1],
        sales: item.sales,
      }
    })

    console.log("Consultas concluídas, retornando dados")

    // Return data
    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalStores,
      totalProducts,
      totalPanfletos,
      totalSales,
      totalRevenue,
      usersByPlan,
      userRegistrationByMonth: userRegistrationData,
      salesByMonth: salesByMonthData,
      systemHealth: {
        cpu: 45,
        memory: 62,
        disk: 28,
        network: 75,
      },
      recentAlerts: [
        { id: 1, type: "error", message: "Falha na conexão com a API de pagamentos", time: "2h atrás" },
        { id: 2, type: "warning", message: "Uso de CPU acima de 80% por 15 minutos", time: "5h atrás" },
        { id: 3, type: "info", message: "Backup automático concluído com sucesso", time: "12h atrás" },
      ],
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

