import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import { authOptions } from "@/lib/auth"
import * as speakeasy from "speakeasy"
import * as QRCode from "qrcode"
import { authenticator } from "otplib"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar usuário
    const usuario = await Usuario.findById(session.user.id)

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Gerar segredo para 2FA se não existir
    if (!usuario.secretTwoFactor) {
      const secret = authenticator.generateSecret()
      usuario.secretTwoFactor = secret
      await usuario.save()
    }

    // Gerar QR code
    const otpauth = authenticator.keyuri(usuario.email, "FletoAds", usuario.secretTwoFactor)

    const qrCodeUrl = await QRCode.toDataURL(otpauth)

    return NextResponse.json({
      qrCodeUrl,
      secret: usuario.secretTwoFactor,
    })
  } catch (error) {
    console.error("Erro ao configurar 2FA:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Gerar segredo para TOTP
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `FletoAds:${session.user.email}`,
    })

    // Gerar QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "")

    return NextResponse.json({
      secret: secret.base32,
      qrCodeUrl,
    })
  } catch (error) {
    console.error("Erro ao configurar autenticação de dois fatores:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar usuário
    const usuario = await Usuario.findById(session.user.id)

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Desativar 2FA
    usuario.twoFactorEnabled = false
    await usuario.save()

    return NextResponse.json({
      message: "Autenticação de dois fatores desativada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao desativar 2FA:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

