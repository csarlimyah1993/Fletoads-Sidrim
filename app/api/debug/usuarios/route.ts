import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Usuario } from "@/lib/models/usuario"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Buscar todos os usuários
    const usuarios = await Usuario.find({}).lean()

    // Retornar os usuários com informações sensíveis mascaradas para segurança
    const usuariosSeguros = usuarios.map((usuario) => ({
      _id: usuario._id?.toString(),
      nome: usuario.nome,
      email: usuario.email,
      // Verificar se a senha existe
      senhaExiste: !!usuario.password,
      // Mostrar os primeiros caracteres da senha para debug
      senhaPreview: usuario.password ? `${usuario.password.substring(0, 10)}...` : "undefined",
      cpf: usuario.cpf,
      plano: usuario.plano,
      role: usuario.role,
      perfil: usuario.perfil,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
    }))

    return NextResponse.json(usuariosSeguros)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

// Adicionar um endpoint para criar um usuário de teste
export async function POST(request: NextRequest) {
  try {
    const { nome, email, password, role = "user" } = await request.json()

    if (!nome || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Verificar se o usuário já existe
    const usuarioExistente = await Usuario.findOne({ email })

    if (usuarioExistente) {
      // Atualizar o usuário existente
      usuarioExistente.nome = nome
      usuarioExistente.password = password
      usuarioExistente.role = role
      await usuarioExistente.save()

      return NextResponse.json({
        success: true,
        message: "Usuário atualizado com sucesso",
        usuario: {
          _id: usuarioExistente._id.toString(),
          nome: usuarioExistente.nome,
          email: usuarioExistente.email,
          role: usuarioExistente.role,
        },
      })
    }

    // Criar um novo usuário
    const novoUsuario = new Usuario({
      nome,
      email,
      password,
      role,
      plano: "free",
    })

    await novoUsuario.save()

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      usuario: {
        _id: novoUsuario._id.toString(),
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role,
      },
    })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}

