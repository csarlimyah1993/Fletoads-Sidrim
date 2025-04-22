import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Buscar a loja do usuário usando várias possibilidades de ID
    const loja = await db.collection("lojas").findOne({
      $or: [
        { proprietarioId: session.user.id },
        { proprietarioId: new ObjectId(session.user.id) },
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar produtos da loja para extrair categorias únicas
    const produtos = await db.collection("produtos").find({ lojaId: loja._id.toString() }).toArray()

    // Extrair categorias únicas
    const categoriasSet = new Set<string>()
    produtos.forEach((produto) => {
      if (produto.categoria) {
        categoriasSet.add(produto.categoria)
      }
    })

    // Converter Set para array e ordenar
    const categorias = Array.from(categoriasSet).sort()

    return NextResponse.json({ categorias })
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ error: "Erro ao buscar categorias", details: (error as Error).message }, { status: 500 })
  }
}
