import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    await connectToDatabase()

    // Buscar usuário pelo email
    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (usuario.emailVerificado) {
      return NextResponse.json({ message: "Email já verificado" }, { status: 200 })
    }

    // Gerar token de verificação
    const token = crypto.randomBytes(32).toString("hex")

    // Salvar token no usuário
    usuario.tokenVerificacaoEmail = token
    usuario.expiraTokenVerificacaoEmail = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    await usuario.save()

    // Enviar email de verificação
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-email?token=${token}`

    await sendVerificationEmail(usuario.email, usuario.nome, verificationUrl)

    return NextResponse.json({
      message: "Email de verificação enviado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao enviar email de verificação:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    await connectToDatabase()

    // Buscar usuário pelo token
    const usuario = await Usuario.findOne({
      tokenVerificacaoEmail: token,
      expiraTokenVerificacaoEmail: { $gt: Date.now() },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    // Marcar email como verificado
    usuario.emailVerificado = true
    usuario.tokenVerificacaoEmail = undefined
    usuario.expiraTokenVerificacaoEmail = undefined
    await usuario.save()

    return NextResponse.json({
      message: "Email verificado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao verificar email:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

