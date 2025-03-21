import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Plano } from "@/lib/models/plano"
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

    // Get all plans
    const plans = await Plano.find({}).sort({ preco: 1 })

    console.log(`Found ${plans.length} plans`)

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json({ error: "Erro ao buscar planos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()

    await connectToDatabase()

    const newPlan = new Plano(data)
    await newPlan.save()

    return NextResponse.json(newPlan, { status: 201 })
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json({ error: "Erro ao criar plano" }, { status: 500 })
  }
}

