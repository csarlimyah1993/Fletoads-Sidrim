import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

    // Buscar cupom
    const cupom = await db.collection("cupons").findOne({
      _id: new ObjectId(id),
      lojaId: session.user.lojaId,
    })

    if (!cupom) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ cupom })
  } catch (error) {
    console.error("Erro ao buscar cupom:", error)
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
    if (!body.codigo || !body.tipo || (body.tipo !== "frete_gratis" && body.valor === undefined)) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o cupom existe e pertence à loja do usuário
    const cupomExistente = await db.collection("cupons").findOne({
      _id: new ObjectId(id),
      lojaId: session.user.lojaId,
    })

    if (!cupomExistente) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 })
    }

    // Verificar se já existe outro cupom com o mesmo código
    const outroCupomMesmoCodigo = await db.collection("cupons").findOne({
      codigo: body.codigo,
      lojaId: session.user.lojaId,
      _id: { $ne: new ObjectId(id) },
    })

    if (outroCupomMesmoCodigo) {
      return NextResponse.json({ error: "Já existe outro cupom com este código" }, { status: 400 })
    }

    // Preparar dados para atualizar
    const cupomData = {
      ...body,
      dataAtualizacao: new Date(),
    }

    // Atualizar no banco de dados
    await db.collection("cupons").updateOne({ _id: new ObjectId(id) }, { $set: cupomData })

    return NextResponse.json({ message: "Cupom atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error)
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

    // Verificar se o cupom existe e pertence à loja do usuário
    const cupomExistente = await db.collection("cupons").findOne({
      _id: new ObjectId(id),
      lojaId: session.user.lojaId,
    })

    if (!cupomExistente) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 })
    }

    // Excluir cupom
    await db.collection("cupons").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Cupom excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir cupom:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
