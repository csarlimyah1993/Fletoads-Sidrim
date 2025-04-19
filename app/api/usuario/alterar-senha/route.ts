import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import Usuario from "@/lib/models/usuario"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { senhaAtual, novaSenha } = await req.json()

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
    }

    // Buscar usuário
    const usuario = await Usuario.findById(session.user.id)

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar senha atual
    const senhaValida = await usuario.comparePassword(senhaAtual)

    if (!senhaValida) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    // Gerar hash da nova senha
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(novaSenha, salt)

    // Atualizar senha
    usuario.senha = senhaHash
    await usuario.save()

    return NextResponse.json({ message: "Senha alterada com sucesso" })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ error: "Erro ao alterar senha" }, { status: 500 })
  }
}

