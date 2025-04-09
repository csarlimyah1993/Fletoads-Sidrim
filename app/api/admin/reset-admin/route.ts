import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { secretKey } = await request.json()

    // Verificar a chave secreta para segurança
    if (secretKey !== process.env.ADMIN_RESET_SECRET && secretKey !== "fletoads_admin_reset") {
      return NextResponse.json({ success: false, message: "Chave secreta inválida" }, { status: 401 })
    }

    await connectToDatabase()

    const adminEmail = "admin@fletoads.com"
    const newPassword = "admin123"

    // Buscar o usuário admin
    const admin = await UsuarioModel.findOne({ email: adminEmail })

    if (!admin) {
      // Criar um novo usuário admin se não existir
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      const newAdmin = new UsuarioModel({
        nome: "Administrador",
        email: adminEmail,
        senha: hashedPassword,
        role: "admin",
        cargo: "admin",
        ativo: true,
        verificado: true,
      })

      await newAdmin.save()

      return NextResponse.json({
        success: true,
        message: "Novo usuário admin criado com sucesso",
        credentials: { email: adminEmail, password: newPassword },
      })
    }

    // Atualizar a senha do admin existente
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    admin.senha = hashedPassword
    await admin.save()

    return NextResponse.json({
      success: true,
      message: "Senha do admin redefinida com sucesso",
      credentials: { email: adminEmail, password: newPassword },
    })
  } catch (error) {
    console.error("Erro ao redefinir senha do admin:", error)
    return NextResponse.json({ success: false, message: "Erro ao redefinir senha do admin" }, { status: 500 })
  }
}

