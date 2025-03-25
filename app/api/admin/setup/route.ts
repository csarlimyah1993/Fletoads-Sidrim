import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectToDatabase()

    // Verificar se já existe um admin
    const adminExists = await Usuario.findOne({ cargo: "admin" })

    if (adminExists) {
      return NextResponse.json({
        success: false,
        message: "Administrador já existe",
        email: adminExists.email,
      })
    }

    // Criar senha hash
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash("admin123", salt)

    // Criar admin
    const admin = new Usuario({
      nome: "Administrador",
      email: "admin@fletoads.com",
      senha: senhaHash,
      cargo: "admin",
      permissoes: ["admin:full"],
      ativo: true,
      ultimoLogin: new Date(),
    })

    await admin.save()

    return NextResponse.json({
      success: true,
      message: "Administrador criado com sucesso",
      email: "admin@fletoads.com",
      senha: "admin123", // Apenas para desenvolvimento
    })
  } catch (error) {
    console.error("Erro ao criar administrador:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao criar administrador",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

