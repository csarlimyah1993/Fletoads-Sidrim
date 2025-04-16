import { NextResponse } from "next/server"
import { sendEmailVerificationCode, verifyEmailOTP } from "@/app/actions/auth-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const result = await sendEmailVerificationCode(email)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json({ error: "Erro ao enviar código de verificação" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json({ error: "Email e código são obrigatórios" }, { status: 400 })
    }

    const result = await verifyEmailOTP(email, otp)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error("Error verifying code:", error)
    return NextResponse.json({ error: "Erro ao verificar código" }, { status: 500 })
  }
}
