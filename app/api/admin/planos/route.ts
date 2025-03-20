import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Plano from "@/lib/models/plano"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get all plans
    const plans = await Plano.find({}).sort({ preco: 1 })

    console.log(`Found ${plans.length} plans`)

    // If no plans exist, create some default plans
    if (plans.length === 0) {
      console.log("No plans found, creating default plans")

      const defaultPlans = [
        {
          nome: "Básico",
          slug: "basico",
          descricao: "Plano básico para pequenos negócios",
          preco: 29.9,
          recursos: ["Até 5 panfletos", "Até 50 produtos", "Suporte por email"],
          limites: {
            panfletos: 5,
            campanhas: 2,
            clientes: 10,
          },
          destaque: false,
          ativo: true,
        },
        {
          nome: "Profissional",
          slug: "profissional",
          descricao: "Plano ideal para negócios em crescimento",
          preco: 59.9,
          recursos: ["Até 15 panfletos", "Até 150 produtos", "Suporte prioritário"],
          limites: {
            panfletos: 15,
            campanhas: 5,
            clientes: 50,
          },
          destaque: true,
          ativo: true,
        },
        {
          nome: "Empresarial",
          slug: "empresarial",
          descricao: "Plano completo para grandes negócios",
          preco: 99.9,
          recursos: ["Panfletos ilimitados", "Produtos ilimitados", "Suporte 24/7"],
          limites: {
            panfletos: 999,
            campanhas: 20,
            clientes: 999,
          },
          destaque: false,
          ativo: true,
        },
      ]

      await Plano.insertMany(defaultPlans)

      // Fetch the newly created plans
      const newPlans = await Plano.find({}).sort({ preco: 1 })

      return NextResponse.json({
        plans: newPlans,
        message: "Default plans created",
      })
    }

    return NextResponse.json({
      plans,
    })
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json(
      { error: "Error fetching plans", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

