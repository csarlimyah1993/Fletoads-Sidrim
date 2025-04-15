import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ isAffiliated: false }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vitrineId = searchParams.get("vitrineId")

    if (!vitrineId) {
      return NextResponse.json({ error: "ID da vitrine não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o usuário já é afiliado
    const affiliate = await db.collection("affiliates").findOne({
      userId: new ObjectId(session.user.id),
      vitrineId: new ObjectId(vitrineId),
    })

    return NextResponse.json({ isAffiliated: !!affiliate })
  } catch (error) {
    console.error("Erro ao verificar afiliação:", error)
    return NextResponse.json({ error: "Erro ao verificar afiliação" }, { status: 500 })
  }
}
