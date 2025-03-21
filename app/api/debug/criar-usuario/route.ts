import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Usuario } from "@/lib/models/usuario"

export async function POST(request: Request) {
  try {
    const { nome, email, password, role = "user" } = await request.json()

    if (!nome || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Verificar se o usuário já existe
    const existingUser = await Usuario.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Usuário com este email já existe" }, { status: 400 })
    }

    // Criar novo usuário
    const newUser = await Usuario.create({
      nome,
      email,
      password, // Em produção, deve-se usar bcrypt para hash
      role, // Incluindo o campo role
    })

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: {
          id: newUser._id,
          nome: newUser.nome,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}

