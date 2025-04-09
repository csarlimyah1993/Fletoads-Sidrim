import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter o email do corpo da requisição
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Buscar o usuário pelo email (case insensitive)
    const usuario = await db.collection("usuarios").findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Remover a senha antes de retornar
    const { senha, password, ...usuarioSemSenha } = usuario

    return NextResponse.json({
      usuario: {
        ...usuarioSemSenha,
        _id: usuarioSemSenha._id.toString(),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
  }
}
