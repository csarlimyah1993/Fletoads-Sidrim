import { type NextRequest, NextResponse } from "next/server"
import Venda from "@/lib/models/venda"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"

export async function GET(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const clienteId = url.searchParams.get("cliente")
    const dataInicio = url.searchParams.get("dataInicio")
    const dataFim = url.searchParams.get("dataFim")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada para este usuário" }, { status: 404 })
    }

    const query: any = { lojaId: loja._id }

    if (status) query.status = status
    if (clienteId) query.cliente = clienteId

    if (dataInicio || dataFim) {
      query.dataVenda = {}
      if (dataInicio) query.dataVenda.$gte = new Date(dataInicio)
      if (dataFim) query.dataVenda.$lte = new Date(dataFim)
    }

    const skip = (page - 1) * limit

    const vendas = await Venda.find(query)
      .sort({ dataVenda: -1 })
      .skip(skip)
      .limit(limit)
      .populate("cliente", "nome email telefone empresa")

    const total = await Venda.countDocuments(query)

    return NextResponse.json({
      vendas,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar vendas:", error)
    return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada para este usuário" }, { status: 404 })
    }

    const body = await req.json()

    // Calcular o valor total com base nos produtos
    const valorTotal = body.produtos.reduce(
      (total: number, produto: { quantidade: number; precoUnitario: number }) =>
        total + produto.quantidade * produto.precoUnitario,
      0,
    )

    // Calcular o subtotal para cada produto
    const produtosComSubtotal = body.produtos.map((produto: { quantidade: number; precoUnitario: number }) => ({
      ...produto,
      subtotal: produto.quantidade * produto.precoUnitario,
    }))

    const novaVenda = new Venda({
      ...body,
      produtos: produtosComSubtotal,
      valorTotal,
      vendedorId: session.user.id,
      lojaId: loja._id,
    })

    await novaVenda.save()

    return NextResponse.json(novaVenda, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar venda:", error)
    return NextResponse.json({ error: "Erro ao criar venda" }, { status: 500 })
  }
}

