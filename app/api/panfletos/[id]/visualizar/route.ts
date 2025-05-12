import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Panfleto } from "@/lib/models/panfleto"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await params

    // Buscar o panfleto
    const panfleto = await Panfleto.findById(new ObjectId(id))

    if (!panfleto) {
      return NextResponse.json({ error: "Panfleto não encontrado" }, { status: 404 })
    }

    // Incrementar o contador de visualizações
    const panfletoAtualizado = await Panfleto.findByIdAndUpdate(
      new ObjectId(id),
      {
        $inc: { visualizacoes: 1 },
        dataAtualizacao: new Date(),
      },
      { new: true, runValidators: true },
    )

    if (!panfletoAtualizado) {
      return NextResponse.json({ error: "Erro ao registrar visualização" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Visualização registrada com sucesso",
      visualizacoes: panfletoAtualizado.visualizacoes,
    })
  } catch (error) {
    console.error("Erro ao registrar visualização:", error)
    return NextResponse.json({ error: "Erro ao registrar visualização" }, { status: 500 })
  }
}
