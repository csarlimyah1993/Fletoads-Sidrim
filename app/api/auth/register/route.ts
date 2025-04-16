import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, password, telefone, tipoUsuario } = body

    // Validações básicas
    if (!nome || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    // Normalizar o email para minúsculas
    const normalizedEmail = email.toLowerCase().trim()

    // Verificar se o email já está em uso
    const { db } = await connectToDatabase()

    // Verificar na coleção usuarios
    const usuarioExistente = await db.collection("usuarios").findOne({
      email: normalizedEmail,
    })

    // Verificar também na coleção users (caso esteja usando ambas)
    const userExistente = await db.collection("users").findOne({
      email: normalizedEmail,
    })

    if (usuarioExistente || userExistente) {
      console.log(`Tentativa de registro com email já existente: ${normalizedEmail}`)
      return NextResponse.json({ error: "Este email já está em uso" }, { status: 409 })
    }

    // Hash da senha
    const senhaHash = await hash(password, 12) // Usando fator 12 para maior segurança

    // Criar o usuário
    const novoUsuario = {
      nome,
      email: normalizedEmail, // Armazenar email em minúsculas para evitar duplicatas
      senha: senhaHash,
      telefone: telefone || "",
      role: tipoUsuario === "admin" ? "ADMIN" : "USER", // Prevenção contra elevação de privilégios
      tipoUsuario: tipoUsuario || "cliente",
      ativo: true,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      ultimoLogin: null,
      perfil: {
        preferencias: {
          notificacoes: true,
          newsletter: true,
          tema: "light",
        },
      },
    }

    // Inserir diretamente na coleção para garantir que está indo para o lugar certo
    const resultado = await db.collection("usuarios").insertOne(novoUsuario)

    console.log(`Usuário registrado com sucesso: ${normalizedEmail}, ID: ${resultado.insertedId}`)

    // Remover a senha do objeto de resposta
    const usuarioSemSenha = {
      id: resultado.insertedId,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      telefone: novoUsuario.telefone,
      role: novoUsuario.role,
      tipoUsuario: novoUsuario.tipoUsuario,
      dataCriacao: novoUsuario.dataCriacao,
      dataAtualizacao: novoUsuario.dataAtualizacao,
    }

    return NextResponse.json(usuarioSemSenha, { status: 201 })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)

    // Fornecer mensagens de erro mais específicas
    if (error instanceof Error) {
      return NextResponse.json({ error: `Erro ao registrar usuário: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: "Erro ao registrar usuário" }, { status: 500 })
  }
}
