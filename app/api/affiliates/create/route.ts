import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { vitrineId, name, email, cpf, phone, birthDate, address } = body

    if (!vitrineId || !name || !email || !cpf || !phone || !birthDate || !address) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se a vitrine/loja existe
    const vitrine = await db.collection("lojas").findOne({
      _id: new ObjectId(vitrineId),
    })

    if (!vitrine) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário é o dono da vitrine
    const userId = session.user.id
    const isOwner =
      (vitrine.usuarioId && (vitrine.usuarioId === userId || vitrine.usuarioId.toString() === userId)) ||
      (vitrine.userId && (vitrine.userId === userId || vitrine.userId.toString() === userId))

    if (isOwner) {
      return NextResponse.json({ error: "Você não pode se afiliar à sua própria vitrine" }, { status: 403 })
    }

    // Verificar se o usuário já é afiliado
    const existingAffiliate = await db.collection("affiliates").findOne({
      userId: new ObjectId(session.user.id),
      vitrineId: new ObjectId(vitrineId),
    })

    if (existingAffiliate) {
      return NextResponse.json({ error: "Você já é afiliado desta vitrine" }, { status: 409 })
    }

    // Criar afiliação
    const result = await db.collection("affiliates").insertOne({
      userId: new ObjectId(session.user.id),
      vitrineId: new ObjectId(vitrineId),
      name,
      email,
      cpf,
      phone,
      birthDate: new Date(birthDate),
      address,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      affiliate: {
        id: result.insertedId,
        userId: session.user.id,
        vitrineId,
        name,
        email,
        cpf,
        phone,
        birthDate,
        address,
      },
    })
  } catch (error) {
    console.error("Erro ao criar afiliação:", error)
    return NextResponse.json({ error: "Erro ao criar afiliação" }, { status: 500 })
  }
}
