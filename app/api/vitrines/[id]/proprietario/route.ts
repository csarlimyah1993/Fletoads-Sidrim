import { NextResponse } from "next/server"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    // Aguardar os parâmetros antes de usá-los
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Buscar a vitrine pelo ID
    const vitrine = await db.collection("lojas").findOne({
      _id: new ObjectId(id),
    })

    if (!vitrine) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário atual é o proprietário
    let isOwner = false
    if (session?.user?.id) {
      const userId = session.user.id
      isOwner =
        (vitrine.usuarioId && (vitrine.usuarioId.toString() === userId || vitrine.usuarioId === userId)) ||
        (vitrine.userId && (vitrine.userId.toString() === userId || vitrine.userId === userId))
    }

    // Buscar informações do proprietário
    let proprietario = null
    if (vitrine.usuarioId || vitrine.userId) {
      const proprietarioId = vitrine.usuarioId || vitrine.userId
      proprietario = await db.collection("usuarios").findOne({
        _id: proprietarioId instanceof ObjectId ? proprietarioId : new ObjectId(proprietarioId),
      })

      if (proprietario) {
        // Remover informações sensíveis
        delete proprietario.password
        delete proprietario.tokens
        delete proprietario.email
        delete proprietario.telefone
      }
    }

    return NextResponse.json({
      isOwner,
      proprietario: proprietario
        ? {
            ...proprietario,
            _id: proprietario._id.toString(),
          }
        : null,
    })
  } catch (error) {
    console.error("Erro ao verificar proprietário:", error)
    return NextResponse.json({ error: "Erro ao verificar proprietário" }, { status: 500 })
  }
}
