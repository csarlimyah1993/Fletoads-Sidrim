import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Parâmetros de busca
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const categoria = searchParams.get("categoria")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const lojaId = searchParams.get("lojaId")

    // Construir filtro
    let filter: any = {}

    // Se temos um lojaId específico, usamos ele
    if (lojaId) {
      filter.lojaId = lojaId
    } else {
      // Caso contrário, buscamos a loja do usuário
      const loja = await db.collection("lojas").findOne({ proprietarioId: session.user.id })

      // Filtro para buscar produtos
      filter = loja ? { lojaId: loja._id.toString() } : { userId: session.user.id }
    }

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 })
    }

    const data = await req.json()
    const userId = session.user.id

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    let loja = await db.collection("lojas").findOne({ proprietarioId: session.user.id })

    // Se não existir loja, criar uma loja padrão
    if (!loja) {
      const novaLoja = {
        nome: `Loja de ${session.user.name || "Usuário"}`,
        descricao: "Loja criada automaticamente",
        proprietarioId: session.user.id,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        ativo: true,
        endereco: {
          rua: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          pais: "Brasil",
        },
        contato: {
          telefone: "",
          email: session.user.email || "",
          whatsapp: "",
        },
      }

      const resultado = await db.collection("lojas").insertOne(novaLoja)
      loja = {
        ...novaLoja,
        _id: resultado.insertedId,
      }

      console.log("Loja padrão criada automaticamente:", loja._id)
    }

    // Preparar dados do produto
    const produtoData = { ...data }

    // Remover campos de envio para produtos não físicos
    if (data.tipoProduto !== "fisico") {
      // Em vez de usar delete, definimos como undefined
      produtoData.peso = undefined
      produtoData.altura = undefined
      produtoData.largura = undefined
      produtoData.comprimento = undefined
      produtoData.tipoFrete = undefined
    }

    // Continuar com a criação do produto
    const novoProduto = {
      ...produtoData,
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
  } catch (error: any) {
    console.error("Erro ao criar produto:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
