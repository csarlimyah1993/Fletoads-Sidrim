import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Integracao from "@/lib/models/integracao"
import Loja from "@/lib/models/loja"

// Listar integrações
export async function GET(req: NextRequest) {
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

    // Parâmetros de paginação
    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const tipo = searchParams.get("tipo")
    const status = searchParams.get("status")

    // Construir a query
    const query: any = { lojaId: loja._id }
    if (tipo) query.tipo = tipo
    if (status) query.status = status

    // Executar a query
    const [integracoes, total] = await Promise.all([
      Integracao.find(query).sort({ dataCriacao: -1 }).skip(skip).limit(limit),
      Integracao.countDocuments(query),
    ])

    // Calcular paginação
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      integracoes,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
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

