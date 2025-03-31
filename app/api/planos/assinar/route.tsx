import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter dados do corpo da requisição
    const data = await request.json()

    // Validar dados
    if (!data.plano || !data.nome || !data.email || !data.cpf) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Criar registro de assinatura
    const assinatura = {
      userId: session.user.id,
      plano: data.plano,
      nome: data.nome,
      email: data.email,
      cpf: data.cpf,
      telefone: data.telefone,
      metodoPagamento: data.metodoPagamento,
      status: "pendente",
      dataAssinatura: new Date(),
      contratoAceito: false,
      dadosPagamento: {
        numeroCartao: data.numeroCartao ? `**** **** **** ${data.numeroCartao.slice(-4)}` : null,
        validadeCartao: data.validadeCartao || null,
        nomeCartao: data.nomeCartao || null,
      },
    }

    const result = await db.collection("assinaturas").insertOne(assinatura)

    // Retornar ID da assinatura
    return NextResponse.json({
      success: true,
      message: "Assinatura criada com sucesso",
      assinaturaId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Erro ao processar assinatura:", error)
    return NextResponse.json({ error: "Erro ao processar assinatura" }, { status: 500 })
  }
}

