import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"
import Usuario from "@/lib/models/usuario"
import Plano from "@/lib/models/plano"

// Define interfaces for our data structures
interface MonthlyRegistration {
  date: string
  count: number
}

interface RevenuePlan {
  plano: string
  preco: number
  usuarios: number
  receita: number
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get total users
    const totalUsers = await Usuario.countDocuments()

    // Get total plans
    const totalPlans = await Plano.countDocuments()

    // Get monthly user registrations for the past 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    let monthlyRegistrations: any[] = []

    // Only proceed if connection is established
    if (mongoose.connection.readyState === 1) {
      monthlyRegistrations = await Usuario.aggregate([
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
      ])
    }

    // Format the monthly data
    const monthlyData: MonthlyRegistration[] = monthlyRegistrations.map((item: any) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      count: item.count,
    }))

    // Get revenue data (assuming plans have a price field)
    let revenueData: RevenuePlan[] = []

    // Only proceed if connection is established
    if (mongoose.connection.readyState === 1) {
      const planCounts = await Usuario.aggregate([
        {
          $lookup: {
            from: "planos",
            localField: "plano",
            foreignField: "_id",
            as: "planoInfo",
          },
        },
        {
          $unwind: {
            path: "$planoInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$planoInfo._id",
            nome: { $first: "$planoInfo.nome" },
            preco: { $first: "$planoInfo.preco" },
            count: { $sum: 1 },
          },
        },
      ])

      revenueData = planCounts.map((plan: any) => ({
        plano: plan.nome || "Sem plano",
        preco: plan.preco || 0,
        usuarios: plan.count,
        receita: (plan.preco || 0) * plan.count,
      }))
    }

    // Calculate total revenue
    const totalRevenue = revenueData.reduce((sum: number, plan: RevenuePlan) => sum + plan.receita, 0)

    return NextResponse.json({
      totalUsers,
      totalPlans,
      monthlyRegistrations: monthlyData,
      revenue: {
        total: totalRevenue,
        byPlan: revenueData,
      },
    })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json(
      {
        error: "Error fetching metrics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

