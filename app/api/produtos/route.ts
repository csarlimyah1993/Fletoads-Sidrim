import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Produto } from "@/lib/models/produto"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Obter parâmetros de consulta
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const categoria = searchParams.get("categoria") || ""
    const userId = session.user.id

    // Construir filtro
    const filtro: any = { userId }

    if (search) {
      filtro.$or = [{ nome: { $regex: search, $options: "i" } }, { descricao: { $regex: search, $options: "i" } }]
    }

    if (categoria) {
      filtro.categoria = categoria
    }

    // Calcular skip para paginação
    const skip = (page - 1) * limit

    // Verificar se o modelo Produto está definido corretamente
    if (!Produto || typeof Produto.countDocuments !== "function") {
      console.error("Modelo Produto não está definido corretamente:", Produto)
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }

    // Contar total de produtos
    const total = await Produto.countDocuments(filtro)

    // Buscar produtos paginados
    const produtos = await Produto.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    return NextResponse.json({
      produtos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    const data = await request.json()
    const userId = session.user.id

    // Criar novo produto
    const novoProduto = new Produto({
      ...data,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await novoProduto.save()

    return NextResponse.json(novoProduto, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}

