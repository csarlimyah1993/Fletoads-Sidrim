import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Updated GET function with proper params type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params promise
    console.log("GET /api/lojas/[id] - Iniciando requisição para ID:", id)

    // Rest of your GET function remains the same
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("GET /api/lojas/[id] - Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!id || !ObjectId.isValid(id)) {
      console.log("GET /api/lojas/[id] - ID inválido:", id)
      return NextResponse.json({ error: "ID de loja inválido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    console.log("GET /api/lojas/[id] - Conectado ao banco de dados, buscando loja com ID:", id)

    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(id) })

    if (!loja) {
      console.log("GET /api/lojas/[id] - Loja não encontrada para ID:", id)
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    console.log("GET /api/lojas/[id] - Loja encontrada:", loja._id.toString())
    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao buscar loja" }, { status: 500 })
  }
}

// Updated PUT function with proper params type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params promise
    console.log("PUT /api/lojas/[id] - Iniciando requisição para ID:", id)

    // Rest of your PUT function remains the same
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("PUT /api/lojas/[id] - Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!id || !ObjectId.isValid(id)) {
      console.log("PUT /api/lojas/[id] - ID inválido:", id)
      return NextResponse.json({ error: "ID de loja inválido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    console.log("PUT /api/lojas/[id] - Conectado ao banco de dados, buscando loja com ID:", id)

    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(id) })

    if (!loja) {
      console.log("PUT /api/lojas/[id] - Loja não encontrada para ID:", id)
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para atualizar esta loja
    const userId = session.user.id
    if (
      loja.userId?.toString() !== userId &&
      loja.proprietarioId?.toString() !== userId &&
      session.user.role !== "admin"
    ) {
      console.log("PUT /api/lojas/[id] - Usuário sem permissão:", userId)
      return NextResponse.json({ error: "Você não tem permissão para atualizar esta loja" }, { status: 403 })
    }

    // Obter os dados do corpo da requisição
    let data
    try {
      data = await request.json()
      console.log("PUT /api/lojas/[id] - Dados recebidos:", JSON.stringify(data).substring(0, 200) + "...")
    } catch (error) {
      console.error("PUT /api/lojas/[id] - Erro ao processar JSON:", error)
      return NextResponse.json({ error: "Formato de dados inválido" }, { status: 400 })
    }

    // Preparar os dados para atualização
    const updateData = {
      nome: data.nome,
      descricao: data.descricao,
      logo: data.logo,
      banner: data.banner,
      endereco: data.endereco,
      contato: data.contato,
      redesSociais: data.redesSociais,
      horarioFuncionamento: data.horarioFuncionamento,
      dataAtualizacao: new Date(),
    }

    console.log(
      "PUT /api/lojas/[id] - Atualizando loja com dados:",
      JSON.stringify(updateData).substring(0, 200) + "...",
    )

    // Atualizar a loja
    const result = await db.collection("lojas").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    console.log("PUT /api/lojas/[id] - Resultado da atualização:", result)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Loja atualizada com sucesso",
      lojaId: id,
    })
  } catch (error) {
    console.error("Erro ao atualizar loja:", error)
    return NextResponse.json({ error: "Erro ao atualizar dados da loja" }, { status: 500 })
  }
}