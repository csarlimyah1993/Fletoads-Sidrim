import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("GET /api/lojas/[id] - Iniciando requisição para ID:", id)

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log("==== INÍCIO: API PUT /api/lojas/[id] ====")
  try {
    const { id } = await params
    console.log("PUT /api/lojas/[id] - Iniciando requisição para ID:", id)

    const session = await getServerSession(authOptions)
    console.log("PUT /api/lojas/[id] - Sessão do usuário:", session ? "Autenticado" : "Não autenticado")

    if (!session) {
      console.log("PUT /api/lojas/[id] - Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!id || !ObjectId.isValid(id)) {
      console.log("PUT /api/lojas/[id] - ID inválido:", id)
      return NextResponse.json({ error: "ID de loja inválido" }, { status: 400 })
    }

    console.log("PUT /api/lojas/[id] - Conectando ao banco de dados...")
    const { db } = await connectToDatabase()
    console.log("PUT /api/lojas/[id] - Conectado ao banco de dados, buscando loja com ID:", id)

    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(id) })
    console.log("PUT /api/lojas/[id] - Loja encontrada:", loja ? "Sim" : "Não")

    if (!loja) {
      console.log("PUT /api/lojas/[id] - Loja não encontrada para ID:", id)
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para atualizar esta loja
    const userId = session.user.id
    console.log("PUT /api/lojas/[id] - Verificando permissão para usuário:", userId)
    console.log("PUT /api/lojas/[id] - Dados da loja:", {
      userId: loja.userId,
      usuarioId: loja.usuarioId,
      proprietarioId: loja.proprietarioId,
    })

    // Verificar todos os possíveis campos de ID
    const userIdMatch = loja.userId?.toString() === userId
    const usuarioIdMatch = loja.usuarioId?.toString() === userId
    const proprietarioIdMatch = loja.proprietarioId?.toString() === userId
    const isAdmin = session.user.role === "admin"

    console.log("PUT /api/lojas/[id] - Verificação de permissões:", {
      userIdMatch,
      usuarioIdMatch,
      proprietarioIdMatch,
      isAdmin,
    })

    if (!userIdMatch && !usuarioIdMatch && !proprietarioIdMatch && !isAdmin) {
      console.log("PUT /api/lojas/[id] - Usuário sem permissão:", userId)
      return NextResponse.json({ error: "Você não tem permissão para atualizar esta loja" }, { status: 403 })
    }

    // Obter os dados do corpo da requisição
    let data
    try {
      console.log("PUT /api/lojas/[id] - Lendo corpo da requisição...")
      const bodyText = await request.text()
      console.log("PUT /api/lojas/[id] - Corpo da requisição (texto):", bodyText.substring(0, 500) + "...")

      data = JSON.parse(bodyText)
      console.log("PUT /api/lojas/[id] - Dados recebidos (JSON):", JSON.stringify(data).substring(0, 500) + "...")
    } catch (error) {
      console.error("PUT /api/lojas/[id] - Erro ao processar JSON:", error)
      return NextResponse.json({ error: "Formato de dados inválido" }, { status: 400 })
    }

    // Preparar os dados para atualização
    // Manter os campos existentes se não forem fornecidos novos valores
    const updateData: Record<string, any> = {
      nome: data.nome !== undefined ? data.nome : loja.nome,
      descricao: data.descricao !== undefined ? data.descricao : loja.descricao,
      logo: data.logo !== undefined ? data.logo : loja.logo,
      banner: data.banner !== undefined ? data.banner : loja.banner,
      endereco: data.endereco !== undefined ? data.endereco : loja.endereco,
      contato: data.contato !== undefined ? data.contato : loja.contato,
      redesSociais: data.redesSociais !== undefined ? data.redesSociais : loja.redesSociais,
      horarioFuncionamento:
        data.horarioFuncionamento !== undefined ? data.horarioFuncionamento : loja.horarioFuncionamento,
      dataAtualizacao: new Date(),
    }

    // Manter os IDs originais
    updateData.userId = loja.userId || data.userId
    updateData.usuarioId = loja.usuarioId || data.usuarioId
    updateData.proprietarioId = loja.proprietarioId || data.proprietarioId

    // Garantir consistência entre userId e usuarioId
    if (updateData.userId && !updateData.usuarioId) {
      updateData.usuarioId = updateData.userId
    } else if (updateData.usuarioId && !updateData.userId) {
      updateData.userId = updateData.usuarioId
    }

    // Manter outros campos importantes que possam existir na loja original
    if (loja.vitrine) updateData.vitrine = loja.vitrine
    if (loja.categorias) updateData.categorias = loja.categorias
    if (loja.status) updateData.status = loja.status
    if (loja.ativo !== undefined) updateData.ativo = loja.ativo
    if (loja.plano) updateData.plano = loja.plano
    if (loja.planoId) updateData.planoId = loja.planoId
    if (loja.proprietarioPlano) updateData.proprietarioPlano = loja.proprietarioPlano
    if (loja.dataAtualizacaoVitrine) updateData.dataAtualizacaoVitrine = loja.dataAtualizacaoVitrine

    console.log(
      "PUT /api/lojas/[id] - Dados preparados para atualização:",
      JSON.stringify(updateData).substring(0, 500) + "...",
    )

    // Atualizar a loja
    console.log("PUT /api/lojas/[id] - Executando atualização no MongoDB...")
    const result = await db.collection("lojas").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    console.log("PUT /api/lojas/[id] - Resultado da atualização:", result)

    if (result.matchedCount === 0) {
      console.log("PUT /api/lojas/[id] - Nenhum documento correspondente encontrado")
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      console.log("PUT /api/lojas/[id] - Documento encontrado, mas nenhuma modificação foi feita")
    }

    console.log("PUT /api/lojas/[id] - Atualização concluída com sucesso")
    return NextResponse.json({
      success: true,
      message: "Loja atualizada com sucesso",
      lojaId: id,
    })
  } catch (error) {
    console.error("Erro detalhado ao atualizar loja:", error)
    return NextResponse.json({ error: "Erro ao atualizar dados da loja" }, { status: 500 })
  } finally {
    console.log("==== FIM: API PUT /api/lojas/[id] ====")
  }
}
