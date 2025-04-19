import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Integracao from "@/lib/models/integracao"
import Loja from "@/lib/models/loja"

// Listar integrações
export async function GET(req: NextRequest) {
  try {
    // Conectar ao banco de dados usando a função correta
    const { db } = await connectToDatabase()
    if (!db) {
      throw new Error("Falha na conexão com o banco de dados")
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Filtro para buscar integrações do usuário
    const userFilter = { userId: session.user.id }

    // Buscar integrações do usuário
    const userIntegracoes = await db.collection("integracoes").find(userFilter).toArray()

    // Buscar todas as integrações disponíveis
    const todasIntegracoes = await db.collection("integracoes_disponiveis").find({}).toArray()

    // Resto do código permanece o mesmo...
    return NextResponse.json({
      userIntegracoes,
      todasIntegracoes,
    })
  } catch (error) {
    console.error("Erro ao listar integrações:", error)
    return NextResponse.json({ error: "Erro ao listar integrações" }, { status: 500 })
  }
}

// Criar integração
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const dados = await req.json()

    // Validar dados
    if (!dados.nome || !dados.tipo) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Criar integração
    const integracao = new Integracao({
      ...dados,
      lojaId: loja._id,
    })

    await integracao.save()

    return NextResponse.json(integracao, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar integração:", error)
    return NextResponse.json({ error: "Erro ao criar integração" }, { status: 500 })
  }
}

