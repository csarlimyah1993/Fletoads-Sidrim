import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Aguardar os parâmetros antes de usá-los
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Buscar avaliações para a vitrine específica
    const avaliacoes = await db.collection("avaliacoes").find({ vitrineId: id }).sort({ createdAt: -1 }).toArray()

    // Transformar os ObjectIds em strings para serialização JSON
    const avaliacoesFormatadas = avaliacoes.map((avaliacao) => ({
      ...avaliacao,
      _id: avaliacao._id.toString(),
      userId: avaliacao.userId?.toString(),
    }))

    return NextResponse.json(avaliacoesFormatadas)
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json({ error: "Erro ao buscar avaliações" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Aguardar os parâmetros antes de usá-los
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Avaliação inválida" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se a vitrine existe
    const vitrine = await db.collection("lojas").findOne({
      _id: new ObjectId(id),
    })

    if (!vitrine) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário já avaliou esta vitrine
    const existingRating = await db.collection("avaliacoes").findOne({
      vitrineId: id,
      userId: new ObjectId(session.user.id),
    })

    if (existingRating) {
      // Atualizar avaliação existente
      await db.collection("avaliacoes").updateOne(
        { _id: existingRating._id },
        {
          $set: {
            rating,
            comment,
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({
        success: true,
        message: "Avaliação atualizada com sucesso",
        rating: {
          ...existingRating,
          rating,
          comment,
          updatedAt: new Date(),
        },
      })
    } else {
      // Criar nova avaliação
      const newRating = {
        vitrineId: id,
        userId: new ObjectId(session.user.id),
        userName: session.user.name || "Usuário",
        userImage: session.user.image || null,
        rating,
        comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("avaliacoes").insertOne(newRating)

      return NextResponse.json({
        success: true,
        message: "Avaliação enviada com sucesso",
        rating: {
          ...newRating,
          _id: result.insertedId,
        },
      })
    }
  } catch (error) {
    console.error("Erro ao enviar avaliação:", error)
    return NextResponse.json({ error: "Erro ao enviar avaliação" }, { status: 500 })
  }
}
