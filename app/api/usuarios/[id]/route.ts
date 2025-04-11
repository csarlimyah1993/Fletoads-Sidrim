import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = params.id

    // Verificar se o usuário está tentando acessar seu próprio perfil ou se é admin
    if (session.user.id !== userId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { db } = await connectToDatabase()

    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Remover campos sensíveis
    const { senha, ...usuarioSemSenha } = usuario

    return NextResponse.json(usuarioSemSenha)
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = params.id

    // Verificar se o usuário está tentando atualizar seu próprio perfil ou se é admin
    if (session.user.id !== userId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const data = await request.json()

    // Remover campos que não devem ser atualizados diretamente
    const { _id, email, senha, role, plano, ...dadosAtualizaveis } = data

    const resultado = await db
      .collection("usuarios")
      .updateOne({ _id: new ObjectId(userId) }, { $set: dadosAtualizaveis })

    if (resultado.matchedCount === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Usuário atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}
