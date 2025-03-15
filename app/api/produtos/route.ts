import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Produto from "@/lib/models/produto"
import Loja from "@/lib/models/loja"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar a loja do usuário usando proprietarioId em vez de usuarioId
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Parâmetros de paginação e filtros
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const categoria = searchParams.get("categoria")
    const ativo = searchParams.get("ativo")
    const destaque = searchParams.get("destaque")
    const busca = searchParams.get("busca")

    // Construir o filtro
    const filter: any = { lojaId: loja._id }

    if (categoria && categoria !== "all") {
      filter.categoria = categoria
    }

    if (ativo === "true") {
      filter.ativo = true
    } else if (ativo === "false") {
      filter.ativo = false
    }

    if (destaque === "true") {
      filter.destaque = true
    }

    if (busca) {
      filter.$or = [
        { nome: { $regex: busca, $options: "i" } },
        { descricao: { $regex: busca, $options: "i" } },
        { sku: { $regex: busca, $options: "i" } },
      ]
    }

    // Contar total de produtos
    const total = await Produto.countDocuments(filter)

    // Buscar produtos com paginação
    const produtos = await Produto.find(filter)
      .sort({ dataCriacao: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    // Calcular total de páginas
    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      produtos,
      pagination: {
        total,
        page,
        limit,
        pages,
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

    await connectToDatabase()

    // Buscar a loja do usuário usando proprietarioId em vez de usuarioId
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const data = await request.json()

    // Validar dados obrigatórios
    if (!data.nome || !data.descricao || !data.preco || !data.categoria || !data.sku) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se já existe um produto com o mesmo SKU
    const produtoExistente = await Produto.findOne({ sku: data.sku, lojaId: loja._id })
    if (produtoExistente) {
      return NextResponse.json({ error: "Já existe um produto com este SKU" }, { status: 400 })
    }

    // Criar o produto
    const novoProduto = await Produto.create({
      ...data,
      lojaId: loja._id,
    })

    return NextResponse.json(novoProduto, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}

