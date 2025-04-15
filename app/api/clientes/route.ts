import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Preparar dados para salvar
    const clienteData = {
      ...body,
      usuarioId: session.user.id,
      lojaId: session.user.lojaId,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),

      // Converter strings vazias para null
      email: body.email || null,
      telefone: body.telefone || null,
      documento: body.documento || null,

      // Converter categorias preferidas para array
      categoriasPreferidasArray: body.categoriasPreferidasString
        ? body.categoriasPreferidasString.split(",").map((item: string) => item.trim())
        : [],
    }

    // Remover campo temporário
    delete clienteData.categoriasPreferidasString

    // Inserir no banco de dados
    const result = await db.collection("clientes").insertOne(clienteData)

    return NextResponse.json(
      {
        message: "Cliente criado com sucesso",
        clienteId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
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

    const { db } = await connectToDatabase()

    // Construir query de busca
    const query: any = {
      lojaId: session.user.lojaId,
    }

    // Adicionar busca por texto se fornecido
    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { telefone: { $regex: search, $options: "i" } },
      ]
    }

    // Buscar clientes
    const clientes = await db
      .collection("clientes")
      .find(query)
      .sort({ dataCriacao: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Contar total de clientes
    const total = await db.collection("clientes").countDocuments(query)

    return NextResponse.json({
      clientes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
