import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, plainPassword } = await request.json()

    console.log("Recebida solicitação para definir senha para:", email)

    if (!email || !plainPassword) {
      console.log("Email ou senha não fornecidos")
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    console.log("Conectando ao banco de dados...")
    await connectToDatabase()
    console.log("Conexão com o banco de dados estabelecida")

    // Gerar hash da senha em texto plano
    console.log("Gerando hash para a senha...")
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(plainPassword, salt)
    console.log("Hash gerado com sucesso:", hashedPassword.substring(0, 10) + "...")

    // Usar diretamente a conexão do Mongoose para atualizar o documento
    console.log("Atualizando senha no banco de dados...")
    const result = await mongoose.connection
      .collection("usuarios")
      .updateOne({ email: email }, { $set: { senha: hashedPassword, updatedAt: new Date() } })

    console.log("Resultado da atualização:", result)

    if (result.matchedCount === 0) {
      console.log("Usuário não encontrado")
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      console.log("Nenhuma modificação foi feita")
      return NextResponse.json(
        { warning: "Nenhuma modificação foi feita. A senha pode ser a mesma que já estava definida." },
        { status: 200 },
      )
    }

    console.log("Senha atualizada com sucesso")
    return NextResponse.json({
      success: true,
      message: "Senha definida com sucesso",
      plainPassword: plainPassword,
      hashedPassword: hashedPassword.substring(0, 10) + "...",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Erro ao definir senha:", error)
    return NextResponse.json({ error: "Erro ao definir senha: " + (error as Error).message }, { status: 500 })
  }
}

