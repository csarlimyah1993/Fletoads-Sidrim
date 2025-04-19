import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import ClienteLoja from "@/lib/models/cliente-loja"
import Loja from "@/lib/models/loja"
import { authOptions } from "../../../../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lojaId = searchParams.get("lojaId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja é obrigatório" }, { status: 400 })
    }

    await connectToDatabase()

    // Verificar se o usuário tem acesso à loja
    const loja = await Loja.findOne({
      _id: lojaId,
      usuarioId: session.user.id,
    })

    if (!loja && session.user.role !== "admin") {
      return NextResponse.json({ error: "Você não tem permissão para acessar esta loja" }, { status: 403 })
    }

    // Construir query de busca
    const query: any = { lojaId }

    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { telefone: { $regex: search, $options: "i" } },
      ]
    }

    // Contar total de clientes
    const total = await ClienteLoja.countDocuments(query)

    // Buscar clientes com paginação
    const clientes = await ClienteLoja.find(query)
      .sort({ dataCadastro: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

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
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { lojaId, nome, email, telefone, endereco, dataNascimento, observacoes } = data

    if (!lojaId || !nome || !email) {
      return NextResponse.json({ error: "Loja, nome e email são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Verificar se o usuário tem acesso à loja
    const loja = await Loja.findOne({
      _id: lojaId,
      usuarioId: session.user.id,
    })

    if (!loja && session.user.role !== "admin") {
      return NextResponse.json({ error: "Você não tem permissão para acessar esta loja" }, { status: 403 })
    }

    // Verificar se já existe um cliente com este email nesta loja
    const clienteExistente = await ClienteLoja.findOne({
      lojaId,
      email,
    })

    if (clienteExistente) {
      return NextResponse.json({ error: "Já existe um cliente com este email" }, { status: 400 })
    }

    // Criar novo cliente
    const novoCliente = new ClienteLoja({
      lojaId,
      nome,
      email,
      telefone,
      endereco,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
      observacoes,
      dataCadastro: new Date(),
    })

    await novoCliente.save()

    return NextResponse.json({
      message: "Cliente cadastrado com sucesso",
      cliente: novoCliente,
    })
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error)
    return NextResponse.json({ error: "Erro ao cadastrar cliente" }, { status: 500 })
  }
}

