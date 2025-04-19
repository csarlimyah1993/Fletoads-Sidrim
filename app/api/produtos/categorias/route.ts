import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Produto from "@/lib/models/produto"
import Loja from "@/lib/models/loja"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar a loja do usuário usando proprietarioId em vez de usuarioId
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar categorias usando agregação (compatível com apiStrict:true)
    const categoriasResult = await Produto.aggregate([
      { $match: { lojaId: loja._id } },
      { $group: { _id: "$categoria" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, categoria: "$_id" } },
    ])

    const categorias = categoriasResult.map((item) => item.categoria)

    return NextResponse.json({ categorias })
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 })
  }
}

