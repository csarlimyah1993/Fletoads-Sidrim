import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Usuario } from "@/lib/models/usuario"
import { Plano } from "@/lib/models/plano"
import { Produto } from "@/lib/models/produto"
import { Panfleto } from "@/lib/models/panfleto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Get total users
    const totalUsers = await Usuario.countDocuments()

    // Get total plans
    const totalPlans = await Plano.countDocuments()

    // Get total products
    const totalProducts = await Produto.countDocuments()

    // Get total panfletos
    const totalPanfletos = await Panfleto.countDocuments()

    // Get users by plan
    const usersByPlan = await Usuario.aggregate([
      {
        $lookup: {
          from: "planos",
          localField: "planoId",
          foreignField: "_id",
          as: "plano",
        },
      },
      {
        $unwind: {
          path: "$plano",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$plano.nome",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          plano: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ])

    // Get new users in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newUsers = await Usuario.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    return NextResponse.json({
      totalUsers,
      totalPlans,
      totalProducts,
      totalPanfletos,
      usersByPlan,
      newUsers,
    })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Erro ao buscar métricas" }, { status: 500 })
  }
}

