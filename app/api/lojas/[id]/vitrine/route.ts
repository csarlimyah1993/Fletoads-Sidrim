import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Função para obter a vitrine de uma loja
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params promise
    console.log("GET /api/lojas/[id]/vitrine - Iniciando requisição para ID:", id)

    if (!id || !ObjectId.isValid(id)) {
      console.log("GET /api/lojas/[id]/vitrine - ID inválido:", id)
      return NextResponse.json({ error: "ID de loja inválido" }, { status: 400 })
    }

    // Restante do seu código GET permanece o mesmo
    const { db } = await connectToDatabase()
    console.log("GET /api/lojas/[id]/vitrine - Conectado ao banco de dados, buscando loja com ID:", id)

    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(id) })

    if (!loja) {
      console.log("GET /api/lojas/[id]/vitrine - Loja não encontrada para ID:", id)
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    console.log("GET /api/lojas/[id]/vitrine - Loja encontrada:", loja._id.toString())
    return NextResponse.json({ vitrine: loja.vitrine || {} })
  } catch (error) {
    console.error("Erro ao buscar vitrine:", error)
    return NextResponse.json({ error: "Erro ao buscar vitrine" }, { status: 500 })
  }
}

// Função para atualizar a vitrine de uma loja
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params promise
    console.log("PUT /api/lojas/[id]/vitrine - Iniciando requisição para ID:", id)

    // Restante do seu código PUT permanece o mesmo
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("PUT /api/lojas/[id]/vitrine - Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!id || !ObjectId.isValid(id)) {
      console.log("PUT /api/lojas/[id]/vitrine - ID inválido:", id)
      return NextResponse.json({ error: "ID de loja inválido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    console.log("PUT /api/lojas/[id]/vitrine - Conectado ao banco de dados, buscando loja com ID:", id)

    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(id) })

    if (!loja) {
      console.log("PUT /api/lojas/[id]/vitrine - Loja não encontrada para ID:", id)
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para atualizar esta loja
    const userId = session.user.id
    if (
      loja.userId?.toString() !== userId &&
      loja.proprietarioId?.toString() !== userId &&
      session.user.role !== "admin"
    ) {
      console.log("PUT /api/lojas/[id]/vitrine - Usuário sem permissão:", userId)
      return NextResponse.json({ error: "Você não tem permissão para atualizar esta vitrine" }, { status: 403 })
    }

    // Obter os dados do corpo da requisição
    let vitrineData
    try {
      vitrineData = await request.json()
      console.log(
        "PUT /api/lojas/[id]/vitrine - Dados recebidos:",
        JSON.stringify(vitrineData).substring(0, 200) + "...",
      )
    } catch (error) {
      console.error("PUT /api/lojas/[id]/vitrine - Erro ao processar JSON:", error)
      return NextResponse.json({ error: "Formato de dados inválido" }, { status: 400 })
    }

    // Atualizar a vitrine da loja
    const result = await db
      .collection("lojas")
      .updateOne({ _id: new ObjectId(id) }, { $set: { vitrine: vitrineData, dataAtualizacaoVitrine: new Date() } })

    console.log("PUT /api/lojas/[id]/vitrine - Resultado da atualização:", result)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Vitrine atualizada com sucesso",
      lojaId: id,
    })
  } catch (error) {
    console.error("Erro ao atualizar vitrine:", error)
    return NextResponse.json({ error: "Erro ao atualizar dados da vitrine" }, { status: 500 })
  }
}

// Adicionar suporte ao método POST para compatibilidade com código existente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Redirecionar para o método PUT
  return PUT(request, { params })
}