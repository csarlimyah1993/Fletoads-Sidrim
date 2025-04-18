import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (session.user.id !== id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { lojaId } = await request.json()
    console.log(`Associando loja ${lojaId} ao usuário ${id}`)

    if (!lojaId || typeof lojaId !== 'string' || !ObjectId.isValid(lojaId)) {
      return NextResponse.json({ error: "ID da loja inválido ou não fornecido" }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(lojaId) })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          lojaId,
          updatedAt: new Date(),
        },
      }
    )

    if (!loja.usuarioId) {
      await db.collection("lojas").updateOne(
        { _id: new ObjectId(lojaId) },
        {
          $set: {
            usuarioId: id,
            dataAtualizacao: new Date(),
          },
        }
      )
    }

    console.log("Loja associada com sucesso")
    return NextResponse.json({ success: true, message: "Loja associada com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao associar loja:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
