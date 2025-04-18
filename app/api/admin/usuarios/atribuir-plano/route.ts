import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import Plano from "@/lib/models/plano"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const { usuarioId, planoId } = await request.json()

    if (!usuarioId || !planoId) {
      return NextResponse.json({ error: "ID do usuário e do plano são obrigatórios" }, { status: 400 })
    }

    // Verificar se o usuário existe
    const usuario = await Usuario.findById(usuarioId)
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o plano existe
    const plano = await Plano.findById(planoId)
    if (!plano) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    // Calcular data de fim com base no intervalo do plano
    const dataInicio = new Date()
    const dataFim = new Date(dataInicio)

    // Converter o documento Mongoose para um objeto JavaScript simples e usar type assertion
    const planoObj = plano.toObject() as any

    // Usar uma abordagem segura para acessar a propriedade intervalo
    const intervalo = planoObj.intervalo || "mensal"

    if (intervalo === "mensal") {
      dataFim.setMonth(dataFim.getMonth() + 1)
    } else if (intervalo === "trimestral") {
      dataFim.setMonth(dataFim.getMonth() + 3)
    } else if (intervalo === "semestral") {
      dataFim.setMonth(dataFim.getMonth() + 6)
    } else if (intervalo === "anual") {
      dataFim.setFullYear(dataFim.getFullYear() + 1)
    } else {
      // Padrão: 30 dias
      dataFim.setDate(dataFim.getDate() + 30)
    }

    // Atribuir plano ao usuário
    usuario.plano = {
      id: plano._id,
      nome: plano.nome,
      slug: planoObj.slug || plano.nome.toLowerCase().replace(/\s+/g, "-"),
      ativo: true,
      dataInicio,
      dataFim,
    }

    await usuario.save()

    // Criar notificação para o usuário (se o modelo existir)
    try {
      if (mongoose.models.Notificacao) {
        const Notificacao = mongoose.models.Notificacao

        await new Notificacao({
          usuario: usuarioId,
          titulo: "Plano Atribuído",
          mensagem: `O plano ${plano.nome} foi atribuído à sua conta pelo administrador.`,
          tipo: "success",
          lida: false,
          dataCriacao: new Date(),
        }).save()
      }
    } catch (notificationError) {
      console.error("Erro ao criar notificação:", notificationError)
      // Não interrompe o fluxo principal se a notificação falhar
    }

    return NextResponse.json({
      success: true,
      message: "Plano atribuído com sucesso",
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        plano: usuario.plano,
      },
    })
  } catch (error) {
    console.error("Erro ao atribuir plano:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao atribuir plano",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
