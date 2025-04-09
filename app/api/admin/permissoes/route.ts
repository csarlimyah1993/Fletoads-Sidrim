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

    // Buscar todos os usuários com suas permissões
    const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", new mongoose.Schema({}, { strict: false }))

    const usuarios = await Usuario.find({}).select("nome email role permissoes").lean()

    // Formatar dados para retorno
    const permissoes = usuarios.map((usuario: any) => ({
      _id: usuario._id.toString(),
      nome: usuario.nome || "Sem nome",
      email: usuario.email,
      role: usuario.role || "user",
      permissoes: usuario.permissoes || {
        dashboard: usuario.role === "admin",
        usuarios: usuario.role === "admin",
        lojas: usuario.role === "admin",
        produtos: usuario.role === "admin",
        vendas: usuario.role === "admin",
        relatorios: usuario.role === "admin",
        configuracoes: usuario.role === "admin",
      },
    }))

    return NextResponse.json({ permissoes })
  } catch (error) {
    console.error("Erro ao buscar permissões:", error)
    return NextResponse.json(
      { error: "Erro ao buscar permissões", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { usuarioId, permissoes } = data

    if (!usuarioId || !permissoes) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Atualizar permissões do usuário
    const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", new mongoose.Schema({}, { strict: false }))

    const usuario = await Usuario.findById(usuarioId)

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    usuario.permissoes = permissoes
    await usuario.save()

    return NextResponse.json({ success: true, message: "Permissões atualizadas com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar permissões:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar permissões", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

