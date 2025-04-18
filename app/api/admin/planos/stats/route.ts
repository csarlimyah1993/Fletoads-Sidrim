import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Plano from "@/lib/models/plano" // Corrected path
import Usuario from "@/lib/models/usuario" // Corrected path

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get all plans
    const planos = await Plano.find({})

    // Get user counts for each plan
    const planStats = await Promise.all(
      planos.map(async (plano: any) => {
        const userCount = await Usuario.countDocuments({ plano: plano._id })

        return {
          id: plano._id,
          nome: plano.nome,
          slug: plano.slug,
          preco: plano.preco,
          ativo: plano.ativo,
          userCount: userCount,
        }
      }),
    )

    // Calculate total plans and active plans
    const totalPlans = planos.length
    const activePlans = planos.filter((p: any) => p.ativo).length

    return NextResponse.json({
      total: totalPlans,
      active: activePlans,
      plans: planStats,
    })
  } catch (error) {
    console.error("Error fetching plan stats:", error)
    return NextResponse.json(
      {
        error: "Error fetching plan stats",
      },
      { status: 500 },
    )
  }
}

