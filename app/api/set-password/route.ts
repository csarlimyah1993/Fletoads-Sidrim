import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, plainPassword } = await request.json()

    if (!email || !plainPassword) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Encontrar o usuário pelo email
    const user = await UsuarioModel.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Gerar hash da senha em texto plano
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(plainPassword, salt)

    // Atualizar a senha do usuário
    user.senha = hashedPassword
    await user.save()

    return NextResponse.json({
      success: true,
      message: "Senha definida com sucesso",
      plainPassword: plainPassword,
      hashedPassword: hashedPassword.substring(0, 10) + "...",
    })
  } catch (error) {
    console.error("Erro ao definir senha:", error)
    return NextResponse.json({ error: "Erro ao definir senha" }, { status: 500 })
  }
}

