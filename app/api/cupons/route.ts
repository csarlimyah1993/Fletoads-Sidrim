import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

// Define a type for the session user with lojaId
interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  nome?: string
  emailVerificado?: boolean
  plano?: string
  lojaId?: string
  permissoes?: string[]
  twoFactorEnabled?: boolean
  twoFactorMethod?: "email" | "app"
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const { db } = await connectToDatabase()

    // Use type assertion to access lojaId
    const user = session.user as SessionUser

    // Construir query de busca
    const query: any = {
      lojaId: user.lojaId,
    }

    // Adicionar busca por texto se fornecido
    if (search) {
      query.$or = [{ codigo: { $regex: search, $options: "i" } }, { descricao: { $regex: search, $options: "i" } }]
    }

    // Adicionar filtro por status se fornecido
    if (status === "ativo") {
      query.ativo = true
    } else if (status === "inativo") {
      query.ativo = false
    }

    // Buscar cupons
    const cupons = await db.collection("cupons").find(query).sort({ dataCriacao: -1 }).skip(skip).limit(limit).toArray()

    // Contar total de cupons
    const total = await db.collection("cupons").countDocuments(query)

    return NextResponse.json({
      cupons,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar cupons:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.codigo || !body.tipo || (body.tipo !== "frete_gratis" && body.valor === undefined)) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Use type assertion to access lojaId
    const user = session.user as SessionUser

    // Verificar se já existe um cupom com o mesmo código
    const cupomExistente = await db.collection("cupons").findOne({
      codigo: body.codigo,
      lojaId: user.lojaId,
    })

    if (cupomExistente) {
      return NextResponse.json({ error: "Já existe um cupom com este código" }, { status: 400 })
    }

    // Preparar dados para salvar
    const cupomData = {
      ...body,
      criadoPor: session.user.id,
      lojaId: user.lojaId,
      usos: 0,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    }

    // Inserir no banco de dados
    const result = await db.collection("cupons").insertOne(cupomData)

    return NextResponse.json(
      {
        message: "Cupom criado com sucesso",
        cupomId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar cupom:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
