import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const panfletos = await db
      .collection("panfletos")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(
      panfletos.map((panfleto) => ({
        ...panfleto,
        _id: panfleto._id.toString(),
      })),
    )
  } catch (error) {
    console.error("Erro ao buscar panfletos:", error)
    return NextResponse.json({ error: "Erro ao buscar panfletos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    const { db } = await connectToDatabase()

    const result = await db.collection("panfletos").insertOne({
      ...body,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      clicks: 0,
    })

    return NextResponse.json({ id: result.insertedId.toString(), success: true }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar panfleto:", error)
    return NextResponse.json({ error: "Erro ao criar panfleto" }, { status: 500 })
  }
}

