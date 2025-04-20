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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Use type assertion to access lojaId
    const user = session.user as SessionUser

    // Buscar cliente
    const cliente = await db.collection("clientes").findOne({
      _id: new ObjectId(id),
      lojaId: user.lojaId,
    })

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ cliente })
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Use type assertion to access lojaId
    const user = session.user as SessionUser

    // Verificar se o cliente existe e pertence à loja do usuário
    const clienteExistente = await db.collection("clientes").findOne({
      _id: new ObjectId(id),
      lojaId: user.lojaId,
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
    await db.collection("clientes").updateOne({ _id: new ObjectId(id) }, { $set: clienteData })

    return NextResponse.json({ message: "Cliente atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Use type assertion to access lojaId
    const user = session.user as SessionUser

    // Verificar se o cliente existe e pertence à loja do usuário
    const clienteExistente = await db.collection("clientes").findOne({
      _id: new ObjectId(id),
      lojaId: user.lojaId,
    })

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Excluir cliente
    await db.collection("clientes").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Cliente excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
