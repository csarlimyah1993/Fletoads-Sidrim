import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar a participação
    const participacao = await db.collection("participacoesEventos").findOne({
      _id: new ObjectId(id),
    })

    if (!participacao) {
      return NextResponse.json({ error: "Participação não encontrada" }, { status: 404 })
    }

    // Atualizar status da participação
    await db.collection("participacoesEventos").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "rejeitado",
          dataResposta: new Date().toISOString(),
        },
      },
    )

    // Remover loja dos participantes do evento (caso tenha sido adicionada anteriormente)
    await db
      .collection("eventos")
      .updateOne({ _id: participacao.eventoId }, { $pull: { lojasParticipantes: participacao.lojaId } })

    // Criar notificação para o lojista
    await db.collection("notificacoesAvancadas").insertOne({
      usuarioId: participacao.usuarioId,
      titulo: "Participação em evento rejeitada",
      mensagem: `Sua solicitação para participar do evento ${participacao.eventoNome} foi rejeitada.`,
      tipo: "error",
      link: "/dashboard",
      icone: "x-circle",
      lida: false,
      dataCriacao: new Date().toISOString(),
      origem: "evento",
      referenciaId: participacao.eventoId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao rejeitar participação:", error)
    return NextResponse.json({ error: "Erro ao rejeitar participação" }, { status: 500 })
  }
}
