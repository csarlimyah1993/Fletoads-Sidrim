import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Define a type for the session user with lojaId
interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  nome?: string
  emailVerificado?: boolean
  plano?: string
  lojaId?: string
  permissoes?: string[]
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Log para debug
    console.log("Buscando cliente com ID:", id)

    let cliente = null
    let objectId: ObjectId | null = null

    // Tente converter o ID para ObjectId
    try {
      objectId = new ObjectId(id)
      console.log("ID convertido para ObjectId com sucesso")
    } catch (err) {
      console.log("Erro ao converter ID para ObjectId:", err)
      objectId = null
    }

    // Buscar cliente apenas pelo ID, sem verificar lojaId
    if (objectId) {
      cliente = await db.collection("clientes").findOne({
        _id: objectId,
      })
    }

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ cliente })
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Log para debug
    console.log("Atualizando cliente com ID:", id)

    let objectId: ObjectId | null = null

    // Tente converter o ID para ObjectId
    try {
      objectId = new ObjectId(id)
      console.log("ID convertido para ObjectId com sucesso")
    } catch (err) {
      console.log("Erro ao converter ID para ObjectId:", err)
      return NextResponse.json({ error: "ID de cliente inválido" }, { status: 400 })
    }

    // Verificar se o cliente existe
    const clienteExistente = await db.collection("clientes").findOne({
      _id: objectId,
    })

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Preparar dados para atualizar
    const clienteData = {
      ...body,
      dataAtualizacao: new Date(),

      // Converter strings vazias para null
      email: body.email || null,
      telefone: body.telefone || null,
      documento: body.documento || null,

      // Converter categorias preferidas para array
      categoriasPreferidasArray: body.categoriasPreferidasString
        ? body.categoriasPreferidasString.split(",").map((item: string) => item.trim())
        : [],
    }

    // Remover campo temporário
    delete clienteData.categoriasPreferidasString

    // Atualizar no banco de dados
    const updateResult = await db.collection("clientes").updateOne({ _id: objectId }, { $set: clienteData })

    console.log("Resultado da atualização:", updateResult)

    return NextResponse.json({ message: "Cliente atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Log para debug
    console.log("Excluindo cliente com ID:", id)

    let objectId: ObjectId | null = null

    // Tente converter o ID para ObjectId
    try {
      objectId = new ObjectId(id)
      console.log("ID convertido para ObjectId com sucesso")
    } catch (err) {
      console.log("Erro ao converter ID para ObjectId:", err)
      return NextResponse.json({ error: "ID de cliente inválido" }, { status: 400 })
    }

    // Verificar se o cliente existe
    const clienteExistente = await db.collection("clientes").findOne({
      _id: objectId,
    })

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Excluir cliente
    const deleteResult = await db.collection("clientes").deleteOne({ _id: objectId })

    console.log("Resultado da exclusão:", deleteResult)

    return NextResponse.json({ message: "Cliente excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
