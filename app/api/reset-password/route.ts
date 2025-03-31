import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email e nova senha são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Encontrar o usuário pelo email
    const user = await UsuarioModel.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Gerar hash da nova senha
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Atualizar a senha do usuário
    user.senha = hashedPassword
    await user.save()

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso",
    })
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}

