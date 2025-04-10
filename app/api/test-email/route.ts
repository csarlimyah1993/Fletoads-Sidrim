import { NextResponse } from "next/server"
import { sendOtpEmail } from "@/lib/email-service"

export async function GET(request: Request) {
  try {
    // Extrair o email do parâmetro de consulta
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Gerar um código OTP de teste
    const testOtpCode = "123456"

    // Tentar enviar o email
    const emailSent = await sendOtpEmail(email, testOtpCode)

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Email de teste enviado com sucesso para ${email}`,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao enviar email de teste",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erro ao testar envio de email:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar solicitação",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
