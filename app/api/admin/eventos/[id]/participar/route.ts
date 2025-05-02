import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { lojaId } = await request.json()

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o evento existe
    const evento = await db.collection("eventos").findOne({ _id: new ObjectId(id) })
    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    }

    // Verificar se já existe uma solicitação para esta loja neste evento
    const participacaoExistente = await db.collection("participacoesEventos").findOne({
      eventoId: id,
      lojaId,
    })

    if (participacaoExistente) {
      return NextResponse.json({ error: "Esta loja já solicitou participação neste evento" }, { status: 400 })
    }

    // Criar solicitação de participação
    await db.collection("participacoesEventos").insertOne({
      eventoId: id,
      eventoNome: evento.nome,
      lojaId,
      usuarioId: session.user.id,
      status: "pendente",
      dataSolicitacao: new Date().toISOString(),
    })

    // Criar notificação para administradores
    await db.collection("notificacoesAdmin").insertOne({
      titulo: "Nova solicitação de participação em evento",
      mensagem: `Uma loja solicitou participação no evento ${evento.nome}`,
      tipo: "info",
      link: "/admin/eventos/participacoes",
      lida: false,
      dataCriacao: new Date().toISOString(),
      eventoId: id,
      lojaId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao solicitar participação:", error)
    return NextResponse.json({ error: "Erro ao solicitar participação" }, { status: 500 })
  }
}
