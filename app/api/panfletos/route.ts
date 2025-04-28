import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Panfleto } from "@/lib/models/panfleto"
import { Loja } from "@/lib/models/loja"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Parâmetros de busca
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const categoria = searchParams.get("categoria")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const tipo = searchParams.get("tipo")
    const status = searchParams.get("status")

    // Buscar a loja do usuário
    const loja = await Loja.findOne({
      $or: [
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
        { proprietarioId: session.user.id },
        { proprietarioId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Construir filtro
    const filter: any = { lojaId: loja._id }

    if (search) {
      filter.$or = [{ titulo: { $regex: search, $options: "i" } }, { descricao: { $regex: search, $options: "i" } }]
    }

    if (categoria && categoria !== "todos") {
      filter.categoria = categoria
    }

    if (tipo && tipo !== "todos") {
      filter.tipo = tipo
    }

    if (status && status !== "todos") {
      filter.status = status
    }

    // Buscar panfletos com paginação
    const skip = (page - 1) * limit
    const panfletos = await Panfleto.find(filter).sort({ dataCriacao: -1 }).skip(skip).limit(limit).lean()

    const total = await Panfleto.countDocuments(filter)

    return NextResponse.json({
      panfletos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar panfletos:", error)
    return NextResponse.json({ error: "Erro ao buscar panfletos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.error("Não autorizado: Sessão inválida")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const userId = session.user.id
    console.log("User ID from session:", userId)

    // Buscar a loja do usuário
    let loja
    try {
      console.log("Buscando loja para o usuário:", userId)
      loja = await Loja.findOne({
        $or: [
          { proprietarioId: userId },
          { proprietarioId: new ObjectId(userId) },
          { usuarioId: userId },
          { usuarioId: new ObjectId(userId) },
          { userId: userId },
          { userId: new ObjectId(userId) },
        ],
      })

      if (!loja) {
        console.log("Loja não encontrada para o usuário:", userId)
        return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
      }

      console.log("Loja encontrada:", loja._id)
    } catch (dbError: any) {
      console.error("Erro ao buscar loja:", dbError)
      return NextResponse.json({ error: "Erro ao buscar loja", details: dbError.message }, { status: 500 })
    }

    const data = await request.json()

    // Verificar campos obrigatórios
    const requiredFields = ["titulo", "descricao", "conteudo", "imagem", "categoria"]
    const missingFields = requiredFields.filter((field) => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Campos obrigatórios ausentes: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Verificar valor válido para status
    // Os valores válidos geralmente são: 'draft', 'active', 'inactive', 'scheduled'
    // Vamos definir um valor padrão se não for fornecido ou for inválido
    if (!data.status || !["draft", "active", "inactive", "scheduled"].includes(data.status)) {
      data.status = "active" // Alterado de "draft" para "active"
    }

    // Criar o panfleto com os dados validados
    const panfletoData = {
      ...data,
      lojaId: loja._id,
      usuarioId: userId,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    }

    const novoPanfleto = await Panfleto.create(panfletoData)
    return NextResponse.json(novoPanfleto, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar panfleto:", error)

    // Melhorar a mensagem de erro para incluir detalhes da validação
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    return NextResponse.json(
      {
        error: "Erro ao criar panfleto",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
