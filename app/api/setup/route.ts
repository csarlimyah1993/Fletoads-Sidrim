import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectToDatabase()

    // Verificar se já existe um usuário admin
    const adminExists = await UsuarioModel.findOne({ role: "admin" })

    if (adminExists) {
      return NextResponse.json({
        message: "Usuário admin já existe",
        email: adminExists.email,
        id: adminExists._id.toString(),
      })
    }

    // Criar senha hash
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash("admin123", salt)

    // Criar usuário admin
    const admin = new UsuarioModel({
      nome: "Administrador",
      email: "admin@fletoads.com",
      senha: senhaHash,
      role: "admin",
      ativo: true,
      verificado: true,
    })

    await admin.save()

    return NextResponse.json({
      message: "Usuário admin criado com sucesso",
      email: admin.email,
      id: admin._id.toString(),
    })
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error)
    return NextResponse.json({ error: "Erro ao criar usuário admin" }, { status: 500 })
  }
}

