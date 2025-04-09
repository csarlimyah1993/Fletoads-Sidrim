import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar todas as lojas
    const Loja = mongoose.models.Loja || mongoose.model("Loja", new mongoose.Schema({}, { strict: false }))
    const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", new mongoose.Schema({}, { strict: false }))
    const Produto = mongoose.models.Produto || mongoose.model("Produto", new mongoose.Schema({}, { strict: false }))

    const lojas = await Loja.find({}).lean()

    // Para cada loja, buscar o proprietário e contar produtos
    const lojasComInfo = await Promise.all(
      lojas.map(async (loja: any) => {
        // Buscar proprietário
        const proprietario = loja.usuarioId ? await Usuario.findById(loja.usuarioId).select("nome email").lean() : null

        // Contar produtos
        const produtosCount = await Produto.countDocuments({ lojaId: loja._id.toString() })

        return {
          ...loja,
          _id: loja._id.toString(),
          proprietario,
          produtosCount,
          createdAt: loja.createdAt ? loja.createdAt.toISOString() : null,
          updatedAt: loja.updatedAt ? loja.updatedAt.toISOString() : null,
        }
      }),
    )

    return NextResponse.json({ lojas: lojasComInfo })
  } catch (error) {
    console.error("Erro ao buscar lojas:", error)
    return NextResponse.json({ error: "Erro ao buscar lojas" }, { status: 500 })
  }
}

