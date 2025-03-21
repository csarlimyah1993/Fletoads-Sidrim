import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Usuario } from "@/lib/models/usuario"

export async function GET() {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Certifique-se de que session.user.id existe
    if (!session.user.id) {
      console.error("ID do usuário não encontrado na sessão:", session)
      return NextResponse.json({ error: "ID do usuário não encontrado" }, { status: 400 })
    }

    const usuario = await Usuario.findById(session.user.id).select("-senha")

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil do usuário" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Campos que não podem ser atualizados pelo usuário
    delete data.email
    delete data.senha
    delete data.plano

    const usuario = await Usuario.findByIdAndUpdate(
      session.user.id,
      { $set: data },
      { new: true, runValidators: true },
    ).select("-senha")

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar perfil do usuário" }, { status: 500 })
  }
}

