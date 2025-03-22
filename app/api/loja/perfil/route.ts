import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    // Validar dados mínimos
    if (!data.nome) {
      return NextResponse.json({ error: "Nome da loja é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o usuário já tem uma loja
    const lojaExistente = await db.collection("lojas").findOne({
      $or: [{ usuarioId: userId }, { userId: userId }],
    })

    if (lojaExistente) {
      // Atualizar loja existente
      const resultado = await db.collection("lojas").updateOne(
        { _id: lojaExistente._id },
        {
          $set: {
            ...data,
            usuarioId: userId,
            dataAtualizacao: new Date(),
          },
        },
      )

      if (!resultado.acknowledged) {
        return NextResponse.json({ error: "Falha ao atualizar loja" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Loja atualizada com sucesso",
        lojaId: lojaExistente._id.toString(),
      })
    } else {
      // Criar nova loja
      const novaLoja = {
        ...data,
        usuarioId: userId,
        ativo: true,
        dataCriacao: new Date(),
      }

      const resultado = await db.collection("lojas").insertOne(novaLoja)

      if (!resultado.acknowledged) {
        return NextResponse.json({ error: "Falha ao criar loja" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Loja criada com sucesso",
        lojaId: resultado.insertedId.toString(),
      })
    }
  } catch (error) {
    console.error("Erro ao salvar loja:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

