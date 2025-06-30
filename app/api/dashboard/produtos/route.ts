import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Validação segura de ObjectId
function isObjectIdLike(id: any): boolean {
  return typeof id === "string" && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id)
}

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
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const lojaId = searchParams.get("lojaId")
    const userId = session.user.id

    console.log("Buscando produtos para o usuário:", userId)

    // Montar consulta segura para buscar loja
    const lojaQuery = [
      { proprietarioId: userId },
      { usuarioId: userId },
      { userId: userId },
    ]

    if (isObjectIdLike(userId)) {
      const objId = new ObjectId(userId)
      lojaQuery.push(
        { proprietarioId: objId.toString() },
        { usuarioId: objId.toString() },
        { userId: objId.toString() }
      )
    }

    const loja = await db.collection("lojas").findOne({ $or: lojaQuery })

    console.log("Loja encontrada:", loja ? loja._id : "Nenhuma loja encontrada")

    // Construir filtro de produtos
    const filter: any = {}

    if (lojaId) {
      filter.lojaId = lojaId
    } else if (loja) {
      filter.lojaId = loja._id.toString()
    } else {
      const fallbackQuery = [
        { userId },
        { usuarioId: userId },
        { proprietarioId: userId },
      ]
      if (isObjectIdLike(userId)) {
        const objId = new ObjectId(userId)
        fallbackQuery.push(
          { userId: objId.toString() },
          { usuarioId: objId.toString() },
          { proprietarioId: objId.toString() }
        )
      }
      filter.$or = fallbackQuery
    }

    if (search) {
      filter.$or = [
        { nome: { $regex: search, $options: "i" } },
        { descricao: { $regex: search, $options: "i" } },
      ]
    }

    if (categoria && categoria !== "todos") {
      filter.categoria = categoria
    }

    console.log("Filtro de busca:", JSON.stringify(filter))

    const skip = (page - 1) * limit
    const count = await db.collection("produtos").countDocuments(filter)
    console.log("Total de produtos encontrados:", count)

    if (count === 0) {
      return NextResponse.json({ produtos: [] })
    }

    const produtos = await db
      .collection("produtos")
      .find(filter)
      .sort({ dataCriacao: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    console.log(`Retornando ${produtos.length} produtos`)

    const produtosSerializados = produtos.map((produto) => ({
      ...produto,
      _id: produto._id.toString(),
      lojaId: produto.lojaId ? produto.lojaId.toString() : null,
      dataCriacao: produto.dataCriacao ? produto.dataCriacao.toISOString() : null,
      dataAtualizacao: produto.dataAtualizacao ? produto.dataAtualizacao.toISOString() : null,
    }))

    return NextResponse.json({
      produtos: produtosSerializados,
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
