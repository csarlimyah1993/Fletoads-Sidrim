import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const vendas = await db.collection("vendas").find({ userId: session.user.id }).sort({ date: -1 }).toArray()

    return NextResponse.json(
      vendas.map((venda) => ({
        id: venda._id.toString(),
        customer: venda.customer,
        product: venda.product,
        amount: venda.amount,
        status: venda.status,
        date: venda.date,
      })),
    )
  } catch (error) {
    console.error("Erro ao buscar vendas:", error)
    return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 })
  }
}

