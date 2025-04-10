import { NextResponse } from "next/server"
import { connectToDatabase, withRetry } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json()

    if (!email || !otpCode) {
      return NextResponse.json({ error: "Email e código são obrigatórios" }, { status: 400 })
    }

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
        return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 })
      }

      // Verificar se o código OTP é válido e não expirou
      const storedOtpCode = user.resetOtpCode
      const otpExpiry = user.resetOtpExpiry

      if (!storedOtpCode || !otpExpiry || otpCode !== storedOtpCode || new Date() > new Date(otpExpiry)) {
        return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 })
      }

      // Gerar token temporário para redefinição de senha
      const tempToken = crypto.randomBytes(32).toString("hex")
      const tokenExpiry = new Date()
      tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 15) // Token válido por 15 minutos

      // Atualizar usuário com o token temporário
      if (isUserCollection) {
        const { db } = await connectToDatabase()
        const usersCollection = db.collection("users")
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              tempResetToken: tempToken,
              tempResetTokenExpiry: tokenExpiry,
              resetOtpCode: null, // Limpar o código OTP após uso
              resetOtpExpiry: null,
            },
          },
          { maxTimeMS: 5000 },
        )
      } else {
        user.tempResetToken = tempToken
        user.tempResetTokenExpiry = tokenExpiry
        user.resetOtpCode = null // Limpar o código OTP após uso
        user.resetOtpExpiry = null
        await user.save({ maxTimeMS: 5000 })
      }

      return NextResponse.json({
        success: true,
        token: tempToken,
      })
    }, 3) // 3 tentativas
  } catch (error) {
    console.error("Erro ao verificar código OTP:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
