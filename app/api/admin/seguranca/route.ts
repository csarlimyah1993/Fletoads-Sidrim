import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import * as speakeasy from "speakeasy"
import * as qrcode from "qrcode"

// GET handler for security settings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    const user = await db.collection("usuarios").findOne({
      _id: new ObjectId(userId),
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Return security settings
    return NextResponse.json({
      twoFactorEnabled: user.twoFactorEnabled || false,
      email: user.email,
      lastLogin: user.lastLogin || null,
    })
  } catch (error) {
    console.error("Error fetching security settings:", error)
    return NextResponse.json({ error: "Erro ao buscar configurações de segurança" }, { status: 500 })
  }
}

// POST handler for enabling 2FA
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    // Generate new TOTP secret
    const secret = speakeasy.generateSecret({
      name: `FletoAds:${session.user.email}`,
    })

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || "")

    // Store the secret temporarily (don't save to DB yet until verified)
    // In a real app, you might want to store this in a temporary session or cache

    // For now, we'll save it to the user document with a flag indicating it's not verified yet
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          twoFactorSecret: secret.base32,
          twoFactorEnabled: false,
          twoFactorPending: true,
        },
      },
    )

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
    })
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    return NextResponse.json({ error: "Erro ao configurar autenticação de dois fatores" }, { status: 500 })
  }
}

// PUT handler for verifying and enabling 2FA
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { token, email } = body

    const { db } = await connectToDatabase()

    // If email is provided, this is a login verification
    if (email) {
      const user = await db.collection("usuarios").findOne({ email })

      if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
        return NextResponse.json({ error: "Usuário não encontrado ou 2FA não ativado" }, { status: 404 })
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 1,
      })

      if (!verified) {
        return NextResponse.json({ error: "Código inválido" }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    // Otherwise, this is enabling 2FA
    const userId = session.user.id

    const user = await db.collection("usuarios").findOne({
      _id: new ObjectId(userId),
    })

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "Configuração de 2FA não iniciada" }, { status: 400 })
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    })

    if (!verified) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    // Enable 2FA
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          twoFactorEnabled: true,
          twoFactorPending: false,
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Autenticação de dois fatores ativada com sucesso",
    })
  } catch (error) {
    console.error("Error verifying 2FA:", error)
    return NextResponse.json({ error: "Erro ao verificar código" }, { status: 500 })
  }
}

// DELETE handler for disabling 2FA
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    const user = await db.collection("usuarios").findOne({
      _id: new ObjectId(userId),
    })

    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA não está ativado" }, { status: 400 })
    }

    // Verify the token one last time
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    })

    if (!verified) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    // Disable 2FA
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          twoFactorEnabled: false,
          twoFactorPending: false,
        },
        $unset: {
          twoFactorSecret: "",
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Autenticação de dois fatores desativada com sucesso",
    })
  } catch (error) {
    console.error("Error disabling 2FA:", error)
    return NextResponse.json({ error: "Erro ao desativar autenticação de dois fatores" }, { status: 500 })
  }
}
