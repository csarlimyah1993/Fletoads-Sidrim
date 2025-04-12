import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { hashPassword, validatePasswordStrength } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, senha, cpf } = body

    // Validar campos obrigatórios
    if (!nome || !email || !senha || !cpf) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(senha)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o email já está em uso
    const existingUser = await db.collection("usuarios").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Este email já está em uso" }, { status: 400 })
    }

    // Verificar se o CPF já está em uso
    const existingCpf = await db.collection("usuarios").findOne({ cpf })
    if (existingCpf) {
      return NextResponse.json({ error: "Este CPF já está cadastrado" }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await hashPassword(senha)

    // Criar novo usuário
    const newUser = {
      nome,
      email,
      cpf,
      senha: hashedPassword,
      role: "user",
      perfil: {
        foto: "",
        telefone: "",
        bio: "",
      },
      endereco: {},
      redesSociais: {},
      preferencias: {
        notificacoes: true,
        temaEscuro: false,
        idioma: "pt-BR",
      },
      permissoes: ["editor"],
      plano: "gratuito",
      ultimoLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("usuarios").insertOne(newUser)

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        userId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
