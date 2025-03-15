import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Integracao from "@/lib/models/integracao"
import Loja from "@/lib/models/loja"

// Obter detalhes de uma integração
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar integração
    const integracao = await Integracao.findOne({
      _id: params.id,
      lojaId: loja._id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json(integracao)
  } catch (error) {
    console.error("Erro ao buscar integração:", error)
    return NextResponse.json({ error: "Erro ao buscar integração" }, { status: 500 })
  }
}

// Atualizar integração
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const dados = await req.json()

    // Atualizar integração
    const integracao = await Integracao.findOneAndUpdate(
      { _id: params.id, lojaId: loja._id },
      { $set: dados },
      { new: true, runValidators: true },
    )

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json(integracao)
  } catch (error) {
    console.error("Erro ao atualizar integração:", error)
    return NextResponse.json({ error: "Erro ao atualizar integração" }, { status: 500 })
  }
}

// Excluir integração
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Excluir integração
    const resultado = await Integracao.findOneAndDelete({
      _id: params.id,
      lojaId: loja._id,
    })

    if (!resultado) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir integração:", error)
    return NextResponse.json({ error: "Erro ao excluir integração" }, { status: 500 })
  }
}

