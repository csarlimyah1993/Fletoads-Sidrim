import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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
    const limit = Number.parseInt(searchParams.get("limit") || "100") // Aumentando o limite para garantir que todos os produtos sejam retornados
    const lojaId = searchParams.get("lojaId")

    console.log("Buscando produtos para o usuário:", session.user.id)

    // Buscar a loja do usuário
    const loja = await db.collection("lojas").findOne({
      $or: [
        { proprietarioId: session.user.id },
        { proprietarioId: new ObjectId(session.user.id) },
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
      ],
    })

    console.log("Loja encontrada:", loja ? loja._id : "Nenhuma loja encontrada")

    // Construir filtro
    const filter: any = {}

    // Se temos um lojaId específico, usamos ele
    if (lojaId) {
      filter.lojaId = lojaId
    } else if (loja) {
      // Caso contrário, buscamos produtos da loja do usuário
      filter.lojaId = loja._id.toString()
    } else {
      // Se não encontrou loja, busca por userId
      filter.$or = [{ userId: session.user.id }, { usuarioId: session.user.id }, { proprietarioId: session.user.id }]
    }

    if (search) {
      filter.$or = [{ nome: { $regex: search, $options: "i" } }, { descricao: { $regex: search, $options: "i" } }]
    }

    if (categoria && categoria !== "todos") {
      filter.categoria = categoria
    }

    console.log("Filtro de busca:", JSON.stringify(filter))

    // Buscar produtos com paginação
    const skip = (page - 1) * limit

    // Verificar se há produtos
    const count = await db.collection("produtos").countDocuments(filter)
    console.log("Total de produtos encontrados:", count)

    if (count === 0) {
      // Retornar array vazio se não houver produtos
      return NextResponse.json([])
    }

    const produtos = await db
      .collection("produtos")
      .find(filter)
      .sort({ dataCriacao: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    console.log(`Retornando ${produtos.length} produtos`)

    // Converter ObjectId para string para evitar problemas de serialização
    const produtosSerializados = produtos.map((produto) => ({
      ...produto,
      _id: produto._id.toString(),
      lojaId: produto.lojaId ? produto.lojaId.toString() : null,
      dataCriacao: produto.dataCriacao ? produto.dataCriacao.toISOString() : null,
      dataAtualizacao: produto.dataAtualizacao ? produto.dataAtualizacao.toISOString() : null,
    }))

    // Retornar diretamente o array de produtos para simplificar o processamento no cliente
    return NextResponse.json(produtosSerializados)
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
    let loja = await db.collection("lojas").findOne({
      $or: [
        { proprietarioId: userId },
        { proprietarioId: new ObjectId(userId) },
        { usuarioId: userId },
        { usuarioId: new ObjectId(userId) },
        { userId: userId },
        { userId: new ObjectId(userId) },
      ],
    })

    // Se não existir loja, criar uma loja padrão
    if (!loja) {
      const novaLoja = {
        nome: `Loja de ${session.user.name || "Usuário"}`,
        descricao: "Loja criada automaticamente",
        proprietarioId: userId,
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
      userId: userId,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      ativo: true, // Garantir que o produto seja criado como ativo por padrão
      destaque: false, // Garantir que o produto não seja destaque por padrão
    }

    const result = await db.collection("produtos").insertOne(novoProduto)

    return NextResponse.json(
      {
        ...novoProduto,
        _id: result.insertedId.toString(),
        dataCriacao: novoProduto.dataCriacao.toISOString(),
        dataAtualizacao: novoProduto.dataAtualizacao.toISOString(),
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Erro ao criar produto:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
