import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const produto = await db.collection("produtos").findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id,
    })

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      ...produto,
      _id: produto._id.toString(),
    })
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    const { db } = await connectToDatabase()

    const result = await db.collection("produtos").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: session.user.id,
      },
      {
        $set: {
          ...body,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("produtos").deleteOne({
      _id: new ObjectId(params.id),
      userId: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}

