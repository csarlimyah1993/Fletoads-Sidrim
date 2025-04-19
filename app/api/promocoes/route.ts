import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import Promocao from "@/lib/models/promocao"
import Loja from "@/lib/models/loja"
import { authOptions } from "../../../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lojaId = searchParams.get("lojaId")
    const ativas = searchParams.get("ativas") === "true"
    const destaque = searchParams.get("destaque") === "true"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    await connectToDatabase()

    // Construir query
    const query: any = {}

    if (lojaId) {
      query.lojaId = lojaId
    }

    if (ativas) {
      const now = new Date()
      query.ativo = true
      query.dataInicio = { $lte: now }
      query.dataFim = { $gte: now }
    }

    if (destaque) {
      query.destaque = true
    }

    // Contar total de promoções
    const total = await Promocao.countDocuments(query)

    // Buscar promoções com paginação
    const promocoes = await Promocao.find(query)
      .sort({ dataCriacao: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      promocoes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar promoções:", error)
    return NextResponse.json({ error: "Erro ao buscar promoções" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const {
      lojaId,
      titulo,
      descricao,
      imagem,
      dataInicio,
      dataFim,
      desconto,
      tipoDesconto,
      codigoPromocional,
      produtosAplicaveis,
      categoriasAplicaveis,
      limitePorCliente,
      quantidadeDisponivel,
      destaque,
    } = data

    if (!lojaId || !titulo || !dataInicio || !dataFim || !desconto) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    await connectToDatabase()

    // Verificar se o usuário tem acesso à loja
    const loja = await Loja.findOne({
      _id: lojaId,
      usuarioId: session.user.id,
    })

    if (!loja && session.user.role !== "admin") {
      return NextResponse.json({ error: "Você não tem permissão para criar promoções nesta loja" }, { status: 403 })
    }

    // Criar nova promoção
    const novaPromocao = new Promocao({
      lojaId,
      titulo,
      descricao,
      imagem,
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      desconto,
      tipoDesconto: tipoDesconto || "percentual",
      codigoPromocional,
      produtosAplicaveis,
      categoriasAplicaveis,
      limitePorCliente,
      quantidadeDisponivel,
      destaque: destaque || false,
      dataCriacao: new Date(),
    })

    await novaPromocao.save()

    return NextResponse.json({
      message: "Promoção criada com sucesso",
      promocao: novaPromocao,
    })
  } catch (error) {
    console.error("Erro ao criar promoção:", error)
    return NextResponse.json({ error: "Erro ao criar promoção" }, { status: 500 })
  }
}

