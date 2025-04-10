import { NextResponse } from "next/server"
import { connectToDatabase, withRetry } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import { sendOtpEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Usar a função withRetry para operações do banco de dados
    return await withRetry(async () => {
      await connectToDatabase()

      // Encontrar o usuário pelo email em múltiplas coleções
      let user = null
      let isUserCollection = false

      try {
        user = await UsuarioModel.findOne({ email }).maxTimeMS(5000)
        if (user) isUserCollection = false
      } catch (error) {
        console.error("Erro ao buscar usuário na coleção 'usuarios':", error)
      }

      // Se não encontrar na coleção "usuarios", tenta na coleção "users"
      if (!user) {
        try {
          const { db } = await connectToDatabase()
          const usersCollection = db.collection("users")
          const userFromUsers = await usersCollection.findOne({ email }, { maxTimeMS: 5000 })

          if (userFromUsers) {
            console.log("Usuário encontrado na coleção 'users'")
            user = userFromUsers
            isUserCollection = true
          }
        } catch (error) {
          console.error("Erro ao buscar usuário na coleção 'users':", error)
        }
      }

      if (!user) {
        // Não informamos ao usuário se o email existe ou não por segurança
        return NextResponse.json({
          success: true,
          message: "Se o email estiver cadastrado, um código de verificação será enviado",
        })
      }

      // Gerar código OTP de 6 dígitos
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const otpExpiry = new Date()
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 15) // Código válido por 15 minutos

      // Atualizar usuário com o código OTP
      if (isUserCollection) {
        const { db } = await connectToDatabase()
        const usersCollection = db.collection("users")
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              resetOtpCode: otpCode,
              resetOtpExpiry: otpExpiry,
            },
          },
          { maxTimeMS: 5000 },
        )
      } else {
        user.resetOtpCode = otpCode
        user.resetOtpExpiry = otpExpiry
        await user.save({ maxTimeMS: 5000 })
      }

      // Enviar email com o código OTP
      const emailSent = await sendOtpEmail(email, otpCode)

      if (!emailSent) {
        console.error(`Falha ao enviar email para ${email}`)
        // Mesmo com falha no email, não informamos ao usuário para evitar vazamento de informações
      }

      return NextResponse.json({
        success: true,
        message: "Se o email estiver cadastrado, um código de verificação será enviado",
      })
    }, 3) // 3 tentativas
  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
