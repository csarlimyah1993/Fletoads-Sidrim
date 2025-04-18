import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"

// Updated type definition for params to match Next.js 15
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar se a loja pertence ao usuário
    const loja = await db.collection("lojas").findOne({
      _id: new ObjectId(id),
      $or: [
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const data = await request.json()

    // Validar dados
    if (!data.nome) {
      return NextResponse.json({ error: "Nome da loja é obrigatório" }, { status: 400 })
    }

    // Atualizar loja
    const updateData: Record<string, any> = {
      nome: data.nome,
      dataAtualizacao: new Date(),
    }

    // Adicionar campos opcionais se fornecidos
    if (data.descricao !== undefined) updateData.descricao = data.descricao
    if (data.logo !== undefined) updateData.logo = data.logo
    if (data.banner !== undefined) updateData.banner = data.banner

    await db.collection("lojas").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar loja:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}

// Updated GET handler to match Next.js 15 type definitions
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()

    const loja = await db.collection("lojas").findOne({
      _id: new ObjectId(id),
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Converter ObjectId para string
    const lojaData = {
      ...loja,
      _id: loja._id.toString(),
    }

    return NextResponse.json(lojaData)
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
