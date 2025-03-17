import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Produto from "@/lib/models/produto"
import Loja from "@/lib/models/loja"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Parâmetros de consulta
    const url = new URL(req.url)
    const categoria = url.searchParams.get("categoria")
    const ativo = url.searchParams.get("ativo")
    const destaque = url.searchParams.get("destaque")
    const busca = url.searchParams.get("busca")
    const limite = Number.parseInt(url.searchParams.get("limite") || "50")
    const pagina = Number.parseInt(url.searchParams.get("pagina") || "1")

    // Construir filtro
    const filtro: any = { lojaId: loja._id }

    if (categoria) filtro.categoria = categoria
    if (ativo !== null) filtro.ativo = ativo === "true"
    if (destaque !== null) filtro.destaque = destaque === "true"
    if (busca) {
      filtro.$or = [
        { nome: { $regex: busca, $options: "i" } },
        { descricao: { $regex: busca, $options: "i" } },
        { sku: { $regex: busca, $options: "i" } },
      ]
    }

    // Contar total de produtos
    const total = await Produto.countDocuments(filtro)

    // Buscar produtos paginados
    const produtos = await Produto.find(filtro)
      .sort({ dataCriacao: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite)

    return NextResponse.json({
      produtos,
      paginacao: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const data = await req.json()

    // Validar dados obrigatórios
    if (!data.nome || !data.descricao || !data.preco || !data.categoria || !data.sku) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se já existe um produto com o mesmo SKU
    const produtoExistente = await Produto.findOne({ sku: data.sku, lojaId: loja._id })
    if (produtoExistente) {
      return NextResponse.json({ error: "Já existe um produto com este SKU" }, { status: 400 })
    }

    // Criar novo produto
    const novoProduto = new Produto({
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      precoPromocional: data.precoPromocional,
      categoria: data.categoria,
      sku: data.sku,
      estoque: data.estoque || 0,
      destaque: data.destaque || false,
      ativo: data.ativo !== undefined ? data.ativo : true,
      imagens: data.imagens || [],
      lojaId: loja._id,
    })

    await novoProduto.save()

    return NextResponse.json(novoProduto)
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}

