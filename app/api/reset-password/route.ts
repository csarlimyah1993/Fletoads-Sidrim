import { NextResponse } from "next/server"
import { connectToDatabase, withRetry } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json()

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
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
        return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
      }

      // Verificar se o token é válido e não expirou
      const storedToken = user.tempResetToken
      const tokenExpiry = user.tempResetTokenExpiry

      if (!storedToken || !tokenExpiry || token !== storedToken || new Date() > new Date(tokenExpiry)) {
        return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
      }

      // Gerar hash da nova senha
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      // Atualizar usuário com a nova senha
      if (isUserCollection) {
        const { db } = await connectToDatabase()
        const usersCollection = db.collection("users")
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              senha: hashedPassword,
              tempResetToken: null, // Limpar o token após uso
              tempResetTokenExpiry: null,
            },
          },
          { maxTimeMS: 5000 },
        )
      } else {
        user.senha = hashedPassword
        user.tempResetToken = null // Limpar o token após uso
        user.tempResetTokenExpiry = null
        await user.save({ maxTimeMS: 5000 })
      }

      return NextResponse.json({
        success: true,
        message: "Senha redefinida com sucesso",
      })
    }, 3) // 3 tentativas
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
