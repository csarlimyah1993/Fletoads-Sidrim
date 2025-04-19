import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Atualizar o usuário no banco de dados
    const { db } = await connectToDatabase()

    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          twoFactorEnabled: false,
          updatedAt: new Date(),
        },
        $unset: {
          twoFactorSecret: "",
          backupCodes: "",
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Autenticação de dois fatores desativada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao desativar autenticação de dois fatores:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

