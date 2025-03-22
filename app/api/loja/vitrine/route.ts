import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    let loja = null

    try {
      // Tentar com ObjectId
      const objectId = new ObjectId(userId)
      loja = await db.collection("lojas").findOne({
        $or: [{ usuarioId: objectId }, { userId: objectId }],
      })
    } catch (error) {
      // Se falhar, tentar com string
      loja = await db.collection("lojas").findOne({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
    }

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Atualizar os dados da vitrine
    const resultado = await db.collection("lojas").updateOne(
      { _id: loja._id },
      {
        $set: {
          banner: data.banner,
          logo: data.logo,
          cores: data.cores,
          dataAtualizacao: new Date(),
        },
      },
    )

    if (!resultado.acknowledged) {
      return NextResponse.json({ error: "Falha ao atualizar vitrine" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Vitrine atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar vitrine:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

