import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const id = await params.id

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    // Se não houver sessão, o usuário não é o proprietário
    if (!session) {
      return NextResponse.json({ isProprietario: false })
    }

    const { db } = await connectToDatabase()

    // Construir a query corretamente para MongoDB
    const query: any = { $or: [] }

    // Adicionar condição para _id se for um ObjectId válido
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) })
    }

    // Adicionar outras condições
    query.$or.push({ "vitrine.slug": id })
    query.$or.push({ vitrineId: id })

    // Buscar a loja
    const loja = await db.collection("lojas").findOne(query)

    if (!loja) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário é o proprietário
    const isProprietario =
      loja.proprietarioId === session.user.id || loja.usuarioId === session.user.id || session.user.role === "admin"

    return NextResponse.json({ isProprietario })
  } catch (error) {
    console.error("Erro ao verificar proprietário:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
