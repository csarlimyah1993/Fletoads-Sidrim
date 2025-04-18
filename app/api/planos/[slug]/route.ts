import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getPlanoBySlug } from "@/lib/planos"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase()

    // Get the session to check authentication if needed
    const session = await getServerSession(authOptions)

    // Get the slug asynchronously from context.params
    const { slug } = await context.params

    // Get the plan by slug
    const plano = await getPlanoBySlug(slug)

    if (!plano) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    return NextResponse.json(plano)
  } catch (error) {
    console.error("Error fetching plan:", error)
    return NextResponse.json({ error: "Erro ao buscar plano" }, { status: 500 })
  }
}
