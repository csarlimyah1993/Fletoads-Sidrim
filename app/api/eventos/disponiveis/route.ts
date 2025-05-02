import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface ParticipacoesPorEvento {
  [eventoId: string]: string
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const lojaId = searchParams.get("lojaId")

    console.log("API eventos/disponiveis: Requisição recebida para lojaId:", lojaId)

    const { db } = await connectToDatabase()

    // Buscar TODOS os eventos para debug
    const todosEventos = await db.collection("eventos").find({}).toArray()
    console.log(`DEBUG: Total de eventos no banco: ${todosEventos.length}`)

    if (todosEventos.length > 0) {
      console.log("DEBUG: Exemplo de evento:", {
        id: todosEventos[0]._id.toString(),
        nome: todosEventos[0].nome,
        ativo: todosEventos[0].ativo,
        dataFim: todosEventos[0].dataFim,
        tipo_dataFim: typeof todosEventos[0].dataFim,
      })
    }

    // Buscar eventos ativos - MODIFICADO: removendo a comparação de data temporariamente
    const eventos = await db
      .collection("eventos")
      .find({
        ativo: true,
        // Removendo temporariamente a comparação de data para debug
        // dataFim: { $gte: new Date().toISOString() },
      })
      .sort({ dataInicio: 1 })
      .toArray()

    console.log(`API eventos/disponiveis: Encontrados ${eventos.length} eventos ativos`)

    // Log para debug dos eventos encontrados
    if (eventos.length > 0) {
      console.log("Primeiro evento ativo:", {
        id: eventos[0]._id.toString(),
        nome: eventos[0].nome,
        dataInicio: eventos[0].dataInicio,
        dataFim: eventos[0].dataFim,
        ativo: eventos[0].ativo,
      })
    }

    // Se não tiver lojaId, retorna apenas os eventos
    if (!lojaId) {
      return NextResponse.json({
        eventos: eventos.map((evento) => ({
          ...evento,
          _id: evento._id.toString(),
        })),
      })
    }

    // Adicionar informações de participação aos eventos
    const eventosComParticipacao = eventos.map((evento) => {
      const eventoId = evento._id.toString()

      // Verificar se a loja está na lista de participantes
      let isParticipante = false
      if (evento.lojasParticipantes && Array.isArray(evento.lojasParticipantes)) {
        // Converter todos os IDs para string para comparação
        const lojasParticipantesStr = evento.lojasParticipantes.map((id) =>
          typeof id === "string" ? id : id.toString(),
        )

        console.log(`DEBUG: Evento ${evento.nome} - lojasParticipantes:`, lojasParticipantesStr)
        console.log(`DEBUG: Verificando se lojaId ${lojaId} está na lista`)

        // Verificar se o lojaId está na lista
        isParticipante = lojasParticipantesStr.includes(lojaId)
        console.log(`DEBUG: isParticipante = ${isParticipante}`)
      }

      // Buscar participações da loja para este evento específico
      return {
        ...evento,
        _id: eventoId,
        participacaoAprovada: isParticipante,
        participacaoPendente: false,
        participacaoRejeitada: false,
      }
    })

    return NextResponse.json({ eventos: eventosComParticipacao })
  } catch (error) {
    console.error("Erro ao buscar eventos disponíveis:", error)
    return NextResponse.json({ error: "Erro ao buscar eventos disponíveis", eventos: [] }, { status: 500 })
  }
}
