import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Usuario from "@/lib/models/usuario"
import { connectToDatabase } from "@/lib/mongodb"

// Rota para obter o perfil do usuário logado
export async function GET(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const usuario = await Usuario.findById(session.user.id).select("-senha")

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil do usuário" }, { status: 500 })
  }
}

// Update the PUT method to handle CPF
export async function PUT(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const dadosAtualizacao = await req.json()

    // Remover campos que não devem ser atualizados diretamente
    delete dadosAtualizacao.senha
    delete dadosAtualizacao.email
    delete dadosAtualizacao.cargo
    delete dadosAtualizacao.permissoes

    // CPF pode ser atualizado
    // Não remover o CPF do objeto de atualização

    const usuario = await Usuario.findByIdAndUpdate(
      session.user.id,
      { $set: dadosAtualizacao },
      { new: true, runValidators: true },
    ).select("-senha")

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar perfil do usuário" }, { status: 500 })
  }
}

