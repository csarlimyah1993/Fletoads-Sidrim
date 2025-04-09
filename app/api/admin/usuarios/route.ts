import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Buscar todos os usuários
    const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", new mongoose.Schema({}, { strict: false }))
    const usuarios = await Usuario.find({}).lean()

    // Formatar dados para retorno
    const usuariosFormatados = usuarios.map((usuario: any) => ({
      _id: usuario._id.toString(),
      nome: usuario.name || usuario.nome || "Sem nome",
      email: usuario.email,
      role: usuario.role || "user",
      ativo: usuario.ativo !== false, // Se não for explicitamente false, considera como true
      createdAt: usuario.createdAt || new Date(),
      ultimoAcesso: usuario.lastLogin || usuario.ultimoAcesso || null,
    }))

    return NextResponse.json({ usuarios: usuariosFormatados })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

