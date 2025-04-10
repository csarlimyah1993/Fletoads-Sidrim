import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Listar todas as coleções
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Resultados para cada coleção relevante
    const results: Record<string, any> = {}

    // Verificar usuários na coleção "usuarios"
    if (collectionNames.includes("usuarios")) {
      const usuarios = await db.collection("usuarios").find({}).toArray()
      results.usuarios = usuarios.map((u) => ({
        _id: u._id.toString(),
        email: u.email,
        nome: u.nome,
        role: u.role,
        cargo: u.cargo,
        // Não incluir a senha por segurança
      }))
    }

    // Verificar usuários na coleção "users" se existir
    if (collectionNames.includes("users")) {
      const users = await db.collection("users").find({}).toArray()
      results.users = users.map((u) => ({
        _id: u._id.toString(),
        email: u.email,
        name: u.name,
        nome: u.nome,
        role: u.role,
        cargo: u.cargo,
        // Não incluir a senha por segurança
      }))
    }

    return NextResponse.json({
      success: true,
      collections: collectionNames,
      results,
    })
  } catch (error) {
    console.error("Erro ao depurar autenticação:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
