import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: "ID da loja não fornecido" }, { status: 400 })
    }

    const body = await request.json()
    const { nome, cnpj, descricao, endereco, contato, categorias, horarioFuncionamento, redesSociais } = body

    const { db } = await connectToDatabase()

    // Verificar se a loja existe e pertence ao usuário
    const loja = await db.collection("lojas").findOne({
      _id: new ObjectId(id),
      $or: [
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
        { proprietarioId: session.user.id },
        { proprietarioId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja) {
      return NextResponse.json(
        { error: "Loja não encontrada ou você não tem permissão para editá-la" },
        { status: 404 },
      )
    }

    // Preparar dados para atualização
    const dadosAtualizados = {
      nome,
      cnpj,
      descricao,
      endereco,
      contato,
      categorias,
      horarioFuncionamento,
      redesSociais,
      dataAtualizacao: new Date(),
    }

    // Remover campos undefined
    Object.keys(dadosAtualizados).forEach((key) => {
      if (dadosAtualizados[key as keyof typeof dadosAtualizados] === undefined) {
        delete dadosAtualizados[key as keyof typeof dadosAtualizados]
      }
    })

    // Atualizar a loja
    await db.collection("lojas").updateOne({ _id: new ObjectId(id) }, { $set: dadosAtualizados })

    return NextResponse.json({
      success: true,
      message: "Loja atualizada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao atualizar loja:", error)
    return NextResponse.json(
      {
        error: "Erro ao atualizar loja",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: "ID da loja não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Buscar a loja
    const loja = await db.collection("lojas").findOne({
      _id: new ObjectId(id),
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Converter ObjectId para string para serialização JSON
    const lojaFormatada = {
      ...loja,
      _id: loja._id.toString(),
      usuarioId: loja.usuarioId ? loja.usuarioId.toString() : undefined,
      proprietarioId: loja.proprietarioId ? loja.proprietarioId.toString() : undefined,
    }

    return NextResponse.json(lojaFormatada)
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar loja",
      },
      { status: 500 },
    )
  }
}
