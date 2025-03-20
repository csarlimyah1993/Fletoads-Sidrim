import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import Plano from "@/lib/models/plano"
import Panfleto from "@/lib/models/panfleto"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get user stats
    const totalUsers = await Usuario.countDocuments()
    const activeUsers = await Usuario.countDocuments({ active: true })

    // Get plan stats
    const totalPlans = await Plano.countDocuments()
    const activePlans = await Plano.countDocuments({ ativo: true })

    // Get panfleto stats
    const totalPanfletos = await Panfleto.countDocuments()

    // Get panfletos created in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentPanfletos = await Panfleto.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    // Get users by plan
    const usersByPlan = await Plano.aggregate([
      {
        $lookup: {
          from: "usuarios",
          localField: "_id",
          foreignField: "plano",
          as: "usuarios",
        },
      },
      {
        $project: {
          nome: 1,
          ativo: 1,
          preco: 1,
          usuarios: { $size: "$usuarios" },
        },
      },
    ])

    // Calculate revenue by plan
    const revenueByPlan = usersByPlan.map((plan) => ({
      plano: plan.nome,
      preco: plan.preco || 0,
      usuarios: plan.usuarios,
      receita: (plan.preco || 0) * plan.usuarios,
    }))

    // Calculate total revenue
    const totalRevenue = revenueByPlan.reduce((sum, plan) => sum + plan.receita, 0)

    // Get monthly registrations for the past 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRegistrations = await Usuario.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" },
                },
              },
            ],
          },
          usuarios: "$count",
        },
      },
    ])

    return NextResponse.json({
      usuarios: {
        total: totalUsers,
        ativos: activeUsers,
        porPlano: usersByPlan,
        registrosMensais: monthlyRegistrations,
      },
      planos: {
        total: totalPlans,
        ativos: activePlans,
      },
      panfletos: {
        total: totalPanfletos,
        recentes: recentPanfletos,
      },
      receita: {
        total: totalRevenue,
        porPlano: revenueByPlan,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      {
        error: "Error fetching dashboard data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

