import { type NextRequest, NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import Panfleto from "@/lib/models/panfleto"
import Produto from "@/lib/models/produto"
import Promocao from "@/lib/models/promocao"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../../lib/auth"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to get the id
    const { id } = await params

    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Check if user exists
    const user = await Usuario.findById(id).select("_id")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get counts of user's content
    // Note: These models might not exist yet, so we'll handle potential errors
    let panfletosCount = 0
    let produtosCount = 0
    let promocoesCount = 0
    let visualizacoesCount = 0
    let cliquesCount = 0

    try {
      if (mongoose.models.Panfleto) {
        panfletosCount = await Panfleto.countDocuments({ usuario: id })
      }
    } catch (error) {
      console.error("Error counting panfletos:", error)
    }

    try {
      if (mongoose.models.Produto) {
        produtosCount = await Produto.countDocuments({ usuario: id })
      }
    } catch (error) {
      console.error("Error counting produtos:", error)
    }

    try {
      if (mongoose.models.Promocao) {
        promocoesCount = await Promocao.countDocuments({ usuario: id })
      }
    } catch (error) {
      console.error("Error counting promocoes:", error)
    }

    // For demonstration purposes, generate random numbers for views and clicks
    visualizacoesCount = Math.floor(Math.random() * 1000)
    cliquesCount = Math.floor(Math.random() * visualizacoesCount)

    return NextResponse.json({
      panfletos: panfletosCount,
      produtos: produtosCount,
      promocoes: promocoesCount,
      visualizacoes: visualizacoesCount,
      cliques: cliquesCount,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Error fetching user statistics" }, { status: 500 })
  }
}
