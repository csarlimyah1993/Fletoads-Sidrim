import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"

export async function POST(req: NextRequest) {
  try {
    const { email, novaSenha } = await req.json()

    if (!email || !novaSenha) {
      return NextResponse.json({ error: "Email e nova senha são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Definir a nova senha
    usuario.senha = novaSenha
    await usuario.save()

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso",
    })
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}

