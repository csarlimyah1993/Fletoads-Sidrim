import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Integracao from "@/lib/models/integracao"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const integracao = await Integracao.findById(id)
    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json(integracao)
  } catch (error) {
    console.error("Erro ao buscar integração:", error)
    return NextResponse.json({ error: "Erro ao buscar integração" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const data = await request.json()

    // Validar dados obrigatórios
    if (!data.nome || !data.tipo) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const integracaoAtualizada = await Integracao.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    )

    if (!integracaoAtualizada) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json(integracaoAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar integração:", error)
    return NextResponse.json({ error: "Erro ao atualizar integração" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const integracaoDeletada = await Integracao.findByIdAndDelete(id)

    if (!integracaoDeletada) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Integração excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir integração:", error)
    return NextResponse.json({ error: "Erro ao excluir integração" }, { status: 500 })
  }
}

