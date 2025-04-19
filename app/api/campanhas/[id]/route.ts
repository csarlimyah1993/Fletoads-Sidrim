import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Campanha from "@/lib/models/campanha"
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

    const campanha = await Campanha.findById(id)

    if (!campanha) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    return NextResponse.json(campanha)
  } catch (error) {
    console.error("Erro ao buscar campanha:", error)
    return NextResponse.json({ error: "Erro ao buscar campanha" }, { status: 500 })
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

    const campanhaAtualizada = await Campanha.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })

    if (!campanhaAtualizada) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    return NextResponse.json(campanhaAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar campanha:", error)
    return NextResponse.json({ error: "Erro ao atualizar campanha" }, { status: 500 })
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

    const campanhaDeletada = await Campanha.findByIdAndDelete(id)

    if (!campanhaDeletada) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Campanha excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir campanha:", error)
    return NextResponse.json({ error: "Erro ao excluir campanha" }, { status: 500 })
  }
}

