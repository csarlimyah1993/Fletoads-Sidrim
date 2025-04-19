import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Venda, Cliente, Produto, ItemVenda, VendaFiltro, Usuario, Paginacao } from "@/types/entities"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    const status = searchParams.get("status")
    const clienteId = searchParams.get("clienteId")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")

    console.log(`API /api/dashboard/vendas - Buscando vendas para o usuário: ${userId}`)

    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    let lojaId: string | null = null

    // Primeiro verificar se o usuário tem lojaId
    const usuario = await db.collection<Usuario>("usuarios").findOne({ _id: new ObjectId(userId) })
    if (usuario && usuario.lojaId) {
      lojaId = typeof usuario.lojaId === "string" ? usuario.lojaId : usuario.lojaId.toString()
    } else {
      // Se não, buscar a loja pelo proprietarioId ou usuarioId
      const loja = await db.collection("lojas").findOne({
        $or: [
          { proprietarioId: userId },
          { proprietarioId: new ObjectId(userId) },
          { usuarioId: userId },
          { usuarioId: new ObjectId(userId) },
        ],
      })

      if (loja) {
        lojaId = loja._id.toString()
      }
    }

    if (!lojaId) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Construir o filtro para as vendas
    const filter: VendaFiltro = { lojaId }

    if (status) {
      filter.status = status
    }

    if (clienteId) {
      filter.clienteId = clienteId
    }

    if (dataInicio || dataFim) {
      filter.dataCriacao = {}

      if (dataInicio) {
        filter.dataCriacao.$gte = new Date(dataInicio)
      }

      if (dataFim) {
        filter.dataCriacao.$lte = new Date(dataFim)
      }
    }

    // Buscar vendas
    const vendas = await db
      .collection<Venda>("vendas")
      .find(filter)
      .sort({ dataCriacao: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Contar total de vendas para paginação
    const total = await db.collection("vendas").countDocuments(filter)

    // Buscar informações dos clientes
    const clienteIds = Array.from(new Set(vendas.map((venda) => venda.clienteId)))
    const clientes = await db
      .collection<Cliente>("clientes")
      .find({ _id: { $in: clienteIds.map((id) => new ObjectId(id.toString())) } })
      .toArray()

    const clientesMap: Record<string, Cliente> = {}
    clientes.forEach((cliente) => {
      clientesMap[cliente._id.toString()] = cliente
    })

    // Buscar informações dos produtos
    const produtoIds = vendas.flatMap((venda) => venda.itens?.map((item) => item.produtoId) || [])
    const uniqueProdutoIds = Array.from(new Set(produtoIds.map((id) => id.toString())))

    const produtos = await db
      .collection<Produto>("produtos")
      .find({ _id: { $in: uniqueProdutoIds.map((id) => new ObjectId(id)) } })
      .toArray()

    const produtosMap: Record<string, Produto> = {}
    produtos.forEach((produto) => {
      produtosMap[produto._id.toString()] = produto
    })

    // Enriquecer os dados das vendas com informações de clientes e produtos
    const vendasEnriquecidas = vendas.map((venda) => {
      const cliente = clientesMap[venda.clienteId.toString()]

      // Enriquecer itens com informações dos produtos
      const itensEnriquecidos: ItemVenda[] =
        venda.itens?.map((item) => {
          const produto = produtosMap[item.produtoId.toString()]
          return {
            ...item,
            produto: produto
              ? {
                  _id: produto._id.toString(),
                  nome: produto.nome,
                  preco: produto.preco,
                  imagem: produto.imagem,
                }
              : undefined,
          }
        }) || []

      return {
        ...venda,
        _id: venda._id?.toString(),
        clienteId: venda.clienteId.toString(),
        lojaId: venda.lojaId.toString(),
        dataCriacao: venda.dataCriacao ? venda.dataCriacao.toISOString() : null,
        dataAtualizacao: venda.dataAtualizacao ? venda.dataAtualizacao.toISOString() : null,
        cliente: cliente
          ? {
              _id: cliente._id.toString(),
              nome: cliente.nome,
              email: cliente.email,
              telefone: cliente.telefone,
            }
          : null,
        itens: itensEnriquecidos,
      }
    })

    const pagination: Paginacao = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }

    return NextResponse.json({
      vendas: vendasEnriquecidas,
      pagination,
    })
  } catch (error) {
    console.error("API /api/dashboard/vendas - Erro ao buscar vendas:", error)
    return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    // Validar dados da venda
    if (!data.clienteId) {
      return NextResponse.json({ error: "Cliente não informado" }, { status: 400 })
    }

    if (!data.itens || !Array.isArray(data.itens) || data.itens.length === 0) {
      return NextResponse.json({ error: "Itens não informados" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    let lojaId: string | null = null

    // Primeiro verificar se o usuário tem lojaId
    const usuario = await db.collection<Usuario>("usuarios").findOne({ _id: new ObjectId(userId) })
    if (usuario && usuario.lojaId) {
      lojaId = typeof usuario.lojaId === "string" ? usuario.lojaId : usuario.lojaId.toString()
    } else {
      // Se não, buscar a loja pelo proprietarioId ou usuarioId
      const loja = await db.collection("lojas").findOne({
        $or: [
          { proprietarioId: userId },
          { proprietarioId: new ObjectId(userId) },
          { usuarioId: userId },
          { usuarioId: new ObjectId(userId) },
        ],
      })

      if (loja) {
        lojaId = loja._id.toString()
      }
    }

    if (!lojaId) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o cliente existe
    const cliente = await db.collection("clientes").findOne({ _id: new ObjectId(data.clienteId) })
    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Verificar se os produtos existem e calcular o total
    const produtoIds = data.itens.map((item: { produtoId: string }) => item.produtoId)
    const produtos = await db
      .collection<Produto>("produtos")
      .find({ _id: { $in: produtoIds.map((id: string) => new ObjectId(id)) } })
      .toArray()

    const produtosMap: Record<string, Produto> = {}
    produtos.forEach((produto) => {
      produtosMap[produto._id.toString()] = produto
    })

    // Validar produtos e calcular total
    let total = 0
    const itensValidados: ItemVenda[] = []

    for (const item of data.itens) {
      const produto = produtosMap[item.produtoId]

      if (!produto) {
        return NextResponse.json({ error: `Produto ${item.produtoId} não encontrado` }, { status: 404 })
      }

      if (item.quantidade <= 0) {
        return NextResponse.json({ error: `Quantidade inválida para o produto ${produto.nome}` }, { status: 400 })
      }

      const subtotal = produto.preco * item.quantidade
      total += subtotal

      itensValidados.push({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: produto.preco,
        subtotal,
      })
    }

    // Aplicar desconto se houver
    if (data.desconto && data.desconto > 0) {
      if (data.desconto >= total) {
        return NextResponse.json({ error: "Desconto não pode ser maior ou igual ao total" }, { status: 400 })
      }

      total -= data.desconto
    }

    // Criar a venda
    const venda = {
      clienteId: data.clienteId,
      lojaId,
      usuarioId: userId,
      itens: itensValidados,
      total,
      desconto: data.desconto || 0,
      formaPagamento: data.formaPagamento || "dinheiro",
      status: data.status || "concluida",
      observacao: data.observacao || "",
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    }

    // Corrigindo o erro de tipo ao inserir a venda
    const result = await db.collection("vendas").insertOne(venda as any)

    // Atualizar estoque dos produtos
    for (const item of itensValidados) {
      await db
        .collection("produtos")
        .updateOne({ _id: new ObjectId(item.produtoId.toString()) }, { $inc: { estoque: -item.quantidade } })
    }

    // Atualizar estatísticas do cliente
    await db.collection("clientes").updateOne(
      { _id: new ObjectId(data.clienteId) },
      {
        $inc: {
          totalGasto: total,
          numeroPedidos: 1,
        },
        $set: {
          ultimaCompra: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Venda registrada com sucesso",
      venda: {
        ...venda,
        _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("API /api/dashboard/vendas - Erro ao registrar venda:", error)
    return NextResponse.json({ error: "Erro ao registrar venda" }, { status: 500 })
  }
}
