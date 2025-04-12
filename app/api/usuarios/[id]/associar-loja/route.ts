import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem permissão para associar loja
    if (session.user.id !== params.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { lojaId } = await request.json()
    console.log(`Associando loja ${lojaId} ao usuário ${params.id}`)

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se a loja existe
    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(lojaId) })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Associar a loja ao usuário
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          lojaId: lojaId,
          updatedAt: new Date(),
        },
      },
    )

    // Atualizar a loja para incluir o usuarioId se não existir
    if (!loja.usuarioId) {
      await db.collection("lojas").updateOne(
        { _id: new ObjectId(lojaId) },
        {
          $set: {
            usuarioId: params.id,
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
