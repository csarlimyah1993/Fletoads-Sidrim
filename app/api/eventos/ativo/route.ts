import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Buscar o evento ativo
    const eventoAtivo = await db.collection("eventos").findOne({ ativo: true })

    if (!eventoAtivo) {
      return NextResponse.json({ eventoAtivo: null })
    }

    // Retornar apenas os dados necessários para a página de registro
    return NextResponse.json({
      eventoAtivo: {
        _id: eventoAtivo._id,
        nome: eventoAtivo.nome,
        descricao: eventoAtivo.descricao,
        imagem: eventoAtivo.imagem,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar evento ativo:", error)
    return NextResponse.json({ error: "Erro ao buscar evento ativo" }, { status: 500 })
  }
}
