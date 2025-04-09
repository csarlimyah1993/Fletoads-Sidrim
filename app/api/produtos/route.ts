import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase, ensureCollectionsExist } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Garantir que as coleções existam
    await ensureCollectionsExist()

    // Buscar a loja do usuário
    const loja = await db.collection("lojas").findOne({ proprietarioId: session.user.id })

    // Filtro para buscar produtos
    const userFilter = loja ? { lojaId: loja._id.toString() } : { userId: session.user.id }

    // Parâmetros de busca
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const categoria = searchParams.get("categoria")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Construir filtro
    const filter: any = { ...userFilter }

    if (search) {
      filter.$or = [{ nome: { $regex: search, $options: "i" } }, { descricao: { $regex: search, $options: "i" } }]
    }

    if (categoria && categoria !== "todos") {
      filter.categoria = categoria
    }

    // Buscar produtos com paginação
    const skip = (page - 1) * limit

    // Verificar se há produtos
    const count = await db.collection("produtos").countDocuments(filter)

    if (count === 0) {
      // Retornar array vazio se não houver produtos
      return NextResponse.json({
        produtos: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      })
    }

    const produtos = await db
      .collection("produtos")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      produtos,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos", details: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    await ensureCollectionsExist()

    const loja = await db.collection("lojas").findOne({ proprietarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const data = await request.json()

    // Validar dados
    if (!data.nome || !data.preco) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Criar produto
    const novoProduto = {
      ...data,
      lojaId: loja._id.toString(),
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("produtos").insertOne(novoProduto)

    return NextResponse.json(
      {
        ...novoProduto,
        _id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
