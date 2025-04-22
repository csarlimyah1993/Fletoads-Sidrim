import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"

// Função auxiliar para serializar ObjectIds e Dates
function serializeData(obj: any): any {
  if (!obj) return obj

  // Se for um array, serializa cada item
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeData(item))
  }

  // Se for um objeto, serializa suas propriedades
  if (typeof obj === "object" && obj !== null) {
    // Se for ObjectId, converte para string
    if (obj instanceof ObjectId) {
      return obj.toString()
    }

    // Se for Date, converte para ISO string
    if (obj instanceof Date) {
      return obj.toISOString()
    }

    // Para outros objetos, serializa recursivamente
    const result: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeData(obj[key])
      }
    }
    return result
  }

  // Valores primitivos são retornados como estão
  return obj
}

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

    // Adicionar dados de endereço, contato e redes sociais
    if (data.endereco) updateData.endereco = data.endereco
    if (data.contato) updateData.contato = data.contato
    if (data.redesSociais) updateData.redesSociais = data.redesSociais

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
    console.log(`Buscando loja com ID: ${id}`)

    const { db } = await connectToDatabase()

    const loja = await db.collection("lojas").findOne({
      _id: new ObjectId(id),
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Garantir que todos os objetos aninhados existam
    const lojaCompleta = {
      ...loja,
      endereco: loja.endereco || {},
      contato: loja.contato || {},
      redesSociais: loja.redesSociais || {},
    }

    // Serializar todos os dados (ObjectIds, Dates, etc)
    const lojaSerializada = serializeData(lojaCompleta)

    console.log("Dados da loja recuperados com sucesso:", {
      id: lojaSerializada._id,
      nome: lojaSerializada.nome,
      temEndereco: !!lojaSerializada.endereco,
      temContato: !!lojaSerializada.contato,
      temRedesSociais: !!lojaSerializada.redesSociais,
    })

    return NextResponse.json(lojaSerializada)
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}

// Adicionar método PUT para compatibilidade com o formulário
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    console.log("Dados recebidos para atualização:", data)

    // Validar dados
    if (!data.nome) {
      return NextResponse.json({ error: "Nome da loja é obrigatório" }, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: Record<string, any> = {
      nome: data.nome,
      descricao: data.descricao || "",
      logo: data.logo || "",
      banner: data.banner || "",
      endereco: data.endereco || {},
      contato: data.contato || {},
      redesSociais: data.redesSociais || {},
      dataAtualizacao: new Date(),
    }

    await db.collection("lojas").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({ success: true, message: "Loja atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar loja:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
