import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Listar todas as coleções
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Criar coleção "usuarios" se não existir
    if (!collectionNames.includes("usuarios")) {
      await db.createCollection("usuarios")
    }

    // Verificar se o usuário admin já existe
    const adminUser = await db.collection("usuarios").findOne({ email: "sidrimthiago@gmail.com" })

    if (!adminUser) {
      // Criar hash da senha
      const hashedPassword = await bcrypt.hash("sidrinho123", 10)

      // Criar usuário admin
      const newAdmin = {
        nome: "Thiago Sidrim Melo",
        email: "sidrimthiago@gmail.com",
        senha: hashedPassword,
        role: "admin",
        cargo: "admin",
        permissoes: ["admin"],
        plano: "admin",
        ultimoLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection("usuarios").insertOne(newAdmin)
    } else {
      // Atualizar usuário existente para garantir que seja admin
      const hashedPassword = await bcrypt.hash("sidrinho123", 10)

      await db.collection("usuarios").updateOne(
        { email: "sidrimthiago@gmail.com" },
        {
          $set: {
            senha: hashedPassword,
            role: "admin",
            cargo: "admin",
            permissoes: ["admin"],
            plano: "admin",
            updatedAt: new Date(),
          },
        },
      )
    }

    // Verificar todas as coleções novamente
    const updatedCollections = await db.listCollections().toArray()
    const usuarios = await db.collection("usuarios").find({}).toArray()

    return NextResponse.json({
      success: true,
      message: "Banco de dados configurado com sucesso",
      collections: updatedCollections.map((c) => c.name),
      usuariosCount: usuarios.length,
      usuarios: usuarios.map((u) => ({
        email: u.email,
        role: u.role,
        cargo: u.cargo,
      })),
    })
  } catch (error) {
    console.error("Erro ao configurar banco de dados:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
