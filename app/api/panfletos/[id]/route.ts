import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Panfleto from "@/lib/models/panfleto"
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

    const panfleto = await Panfleto.findById(id)

    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(panfleto)
  } catch (error) {
    console.error("Erro ao buscar panfleto:", error)
    return NextResponse.json({ error: "Erro ao buscar panfleto" }, { status: 500 })
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

    const panfletoAtualizado = await Panfleto.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })

    if (!panfletoAtualizado) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(panfletoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar panfleto:", error)
    return NextResponse.json({ error: "Erro ao atualizar panfleto" }, { status: 500 })
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

    const panfletoDeletado = await Panfleto.findByIdAndDelete(id)

    if (!panfletoDeletado) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Panfleto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir panfleto:", error)
    return NextResponse.json({ error: "Erro ao excluir panfleto" }, { status: 500 })
  }
}

