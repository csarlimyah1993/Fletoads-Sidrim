import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`PATCH request received for loja ID: ${params.id}`)
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.log("Unauthorized: No session or user")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      console.log("Bad request: No ID provided")
      return NextResponse.json({ error: "ID da loja não fornecido" }, { status: 400 })
    }

    const body = await request.json()
    console.log(`Request body received for loja ${id}:`, JSON.stringify(body, null, 2))

    const { nome, cnpj, descricao, endereco, contato, categorias, horarioFuncionamento, redesSociais, logo, banner } =
      body

    const { db } = await connectToDatabase()

    // Verificar se a loja existe e pertence ao usuário
    console.log(`Checking if loja ${id} belongs to user ${session.user.id}`)
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
      console.log(`Loja ${id} not found or doesn't belong to user ${session.user.id}`)
      return NextResponse.json(
        { error: "Loja não encontrada ou você não tem permissão para editá-la" },
        { status: 404 },
      )
    }

    console.log(`Loja ${id} found and belongs to user ${session.user.id}`)

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
      logo,
      banner,
      dataAtualizacao: new Date(),
    }

    // Remover campos undefined
    Object.keys(dadosAtualizados).forEach((key) => {
      if (dadosAtualizados[key as keyof typeof dadosAtualizados] === undefined) {
        delete dadosAtualizados[key as keyof typeof dadosAtualizados]
      }
    })

    console.log(`Updating loja ${id} with data:`, JSON.stringify(dadosAtualizados, null, 2))

    // Atualizar a loja
    await db.collection("lojas").updateOne({ _id: new ObjectId(id) }, { $set: dadosAtualizados })

    console.log(`Loja ${id} updated successfully`)
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
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
