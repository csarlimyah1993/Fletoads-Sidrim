import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const { id } = await context.params

    // Verificar se a loja existe
    const loja = await db.collection("lojas").findOne({
      _id: new ObjectId(id),
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar produtos da loja
    const produtos = await db
      .collection("produtos")
      .find({ lojaId: id })
      .sort({ destaque: -1, dataCriacao: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Contar total de produtos
    const total = await db.collection("produtos").countDocuments({ lojaId: id })

    return NextResponse.json({
      produtos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar produtos da loja:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
