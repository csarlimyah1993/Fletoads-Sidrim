import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    const loja = await db.collection("lojas").findOne({
      $or: [
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar categorias usando agregação
    const categoriasResult = await db
      .collection("panfletos")
      .aggregate([
        { $match: { lojaId: loja._id.toString() } },
        { $group: { _id: "$categoria" } },
        { $match: { _id: { $ne: null } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, categoria: "$_id" } },
      ])
      .toArray()

    const categorias = categoriasResult.map((item) => item.categoria)

    return NextResponse.json({ categorias })
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 })
  }
}
