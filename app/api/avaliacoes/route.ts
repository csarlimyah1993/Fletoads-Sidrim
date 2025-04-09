import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Avaliacao from "@/lib/models/avaliacao"
import Loja from "@/lib/models/loja"
import Notificacao from "@/lib/models/notificacao"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    const { lojaId, pontuacao, comentario, nome, email } = await req.json()

    if (!lojaId || !pontuacao || !comentario || !nome || !email) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se a loja existe
    const loja = await Loja.findById(lojaId)
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Criar avaliação
    const novaAvaliacao = new Avaliacao({
      usuarioId: session?.user?.id || null,
      lojaId,
      nome,
      email,
      pontuacao,
      comentario,
      dataAvaliacao: new Date(),
      status: "pendente",
    })

    await novaAvaliacao.save()

    // Notificar o dono da loja
    if (loja.usuarioId) {
      const notificacao = new Notificacao({
        usuario: loja.usuarioId,
        titulo: "Nova avaliação recebida",
        mensagem: `Você recebeu uma nova avaliação de ${nome} com ${pontuacao} estrelas.`,
        tipo: "info",
        link: `/dashboard/avaliacoes/${novaAvaliacao._id}`,
      })

      await notificacao.save()
    }

    return NextResponse.json({ success: true, avaliacao: novaAvaliacao }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)
    return NextResponse.json({ error: "Erro ao criar avaliação" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const url = new URL(req.url)
    const lojaId = url.searchParams.get("lojaId")
    const status = url.searchParams.get("status") || "aprovado"
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja é obrigatório" }, { status: 400 })
    }

    const query: any = { lojaId }
    if (status !== "todos") {
      query.status = status
    }

    const skip = (page - 1) * limit

    const avaliacoes = await Avaliacao.find(query).sort({ dataAvaliacao: -1 }).skip(skip).limit(limit)

    const total = await Avaliacao.countDocuments(query)

    return NextResponse.json({
      avaliacoes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json({ error: "Erro ao buscar avaliações" }, { status: 500 })
  }
}

