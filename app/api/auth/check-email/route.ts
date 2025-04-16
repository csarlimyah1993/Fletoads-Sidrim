import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Normalizar o email para minúsculas para garantir consistência
    const normalizedEmail = email.toLowerCase().trim()

    // Verificar na coleção usuarios - usando exatamente o mesmo email
    const usuarioExistente = await db.collection("usuarios").findOne({
      email: normalizedEmail,
    })

    // Verificar também na coleção users (caso esteja usando ambas)
    const userExistente = await db.collection("users").findOne({
      email: normalizedEmail,
    })

    // Log para depuração
    console.log(`Verificação de email: ${normalizedEmail}, Existe: ${!!(usuarioExistente || userExistente)}`)

    if (usuarioExistente) {
      console.log(`Email encontrado na coleção usuarios: ${usuarioExistente._id}`)
    }

    if (userExistente) {
      console.log(`Email encontrado na coleção users: ${userExistente._id}`)
    }

    return NextResponse.json({
      exists: !!(usuarioExistente || userExistente),
      message: usuarioExistente || userExistente ? "Este email já está em uso" : "Email disponível",
    })
  } catch (error) {
    console.error("Erro ao verificar email:", error)
    return NextResponse.json({ error: "Erro ao verificar email" }, { status: 500 })
  }
}
