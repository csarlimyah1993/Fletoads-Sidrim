// app/admin/eventos/route.ts
export const dynamic = 'force-dynamic';

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

    // Buscar todos os eventos
    const VisitanteEvento =
      mongoose.models.VisitanteEvento || mongoose.model("VisitanteEvento", new mongoose.Schema({}, { strict: false }))

    // Agrupar por evento e contar visitantes
    const eventosAggregate = await VisitanteEvento.aggregate([
      {
        $group: {
          _id: "$eventoId",
          nome: { $first: "$eventoNome" },
          local: { $first: "$eventoLocal" },
          data: { $first: "$eventoData" },
          totalVisitantes: { $sum: 1 },
          visitantesUnicos: { $addToSet: "$email" },
        },
      },
      {
        $project: {
          _id: 1,
          nome: 1,
          local: 1,
          data: 1,
          totalVisitantes: 1,
          visitantesUnicos: { $size: "$visitantesUnicos" },
        },
      },
      { $sort: { data: -1 } },
    ])

    // Formatar dados para retorno
    const eventos = eventosAggregate.map((evento: any) => ({
      _id: evento._id.toString(),
      nome: evento.nome || "Evento sem nome",
      local: evento.local || "Local não especificado",
      data: evento.data ? evento.data.toISOString() : null,
      totalVisitantes: evento.totalVisitantes,
      visitantesUnicos: evento.visitantesUnicos,
    }))

    return NextResponse.json({ eventos })
  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar eventos", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}