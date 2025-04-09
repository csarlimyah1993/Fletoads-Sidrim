import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import * as speakeasy from "speakeasy"
import * as crypto from "crypto"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { code, secret } = await request.json()

    if (!code || !secret) {
      return NextResponse.json({ error: "Código ou segredo inválido" }, { status: 400 })
    }

    // Verificar o código
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: code,
      window: 1, // Permite uma janela de 1 período (30 segundos antes e depois)
    })

    if (!verified) {
      return NextResponse.json({ error: "Código de verificação inválido" }, { status: 400 })
    }

    // Gerar códigos de backup
    const backupCodes = Array(8)
      .fill(0)
      .map(() => crypto.randomBytes(4).toString("hex"))

    // Atualizar o usuário no banco de dados
    const { db } = await connectToDatabase()

    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          twoFactorEnabled: true,
          twoFactorSecret: secret,
          backupCodes: backupCodes,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Autenticação de dois fatores ativada com sucesso",
      backupCodes,
    })
  } catch (error) {
    console.error("Erro ao verificar código de autenticação de dois fatores:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

