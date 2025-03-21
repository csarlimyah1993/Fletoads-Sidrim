import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Usuario } from "@/lib/models/usuario"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { email, novaSenha } = await request.json()

    if (!email || !novaSenha) {
      return NextResponse.json({ error: "Email e nova senha são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Buscar o usuário pelo email
    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Atualizar a senha do usuário
    usuario.password = novaSenha
    await usuario.save()

    return NextResponse.json({ success: true, message: "Senha redefinida com sucesso" })
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}

