import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Usuario from "@/lib/models/usuario"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

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

// Rota para atualizar o perfil do usuário logado
export async function PUT(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const dadosAtualizacao = await req.json()
    console.log("Dados recebidos para atualização:", dadosAtualizacao)

    // Remover campos que não devem ser atualizados diretamente
    delete dadosAtualizacao.senha
    delete dadosAtualizacao.email
    delete dadosAtualizacao.role
    delete dadosAtualizacao.permissoes

    // Usar o método updateOne diretamente para atualizar o documento
    const resultado = await Usuario.updateOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      {
        $set: {
          nome: dadosAtualizacao.nome,
          cpf: dadosAtualizacao.cpf,
          perfil: dadosAtualizacao.perfil,
        },
      },
    )

    console.log("Resultado da atualização:", resultado)

    if (resultado.matchedCount === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar o usuário atualizado para retornar
    const usuarioAtualizado = await Usuario.findById(session.user.id).select("-senha")

    console.log("Usuário atualizado com sucesso:", usuarioAtualizado)
    return NextResponse.json(usuarioAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar perfil do usuário" }, { status: 500 })
  }
}
