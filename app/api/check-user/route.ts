import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    await connectToDatabase()

    // Encontrar o usuário pelo email
    const user = await UsuarioModel.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Retornar informações básicas do usuário (sem a senha)
    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      nome: user.nome,
      role: user.role,
      ativo: user.ativo,
      verificado: user.verificado,
      // Incluir apenas os primeiros 10 caracteres do hash da senha para verificação
      senhaHash: user.senha ? user.senha.substring(0, 10) + "..." : null,
    })
  } catch (error) {
    console.error("Erro ao verificar usuário:", error)
    return NextResponse.json({ error: "Erro ao verificar usuário" }, { status: 500 })
  }
}

