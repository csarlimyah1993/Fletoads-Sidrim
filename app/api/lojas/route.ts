import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const lojaData = await request.json()
    console.log("Dados recebidos para criação de loja:", lojaData)

    // Validar campos obrigatórios
    if (!lojaData.nome || !lojaData.proprietarioId) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Garantir consistência entre userId e usuarioId
    // Se userId estiver presente, usar para usuarioId
    // Se usuarioId estiver presente, usar para userId
    // Se nenhum estiver presente, usar proprietarioId para ambos
    if (lojaData.userId && !lojaData.usuarioId) {
      lojaData.usuarioId = lojaData.userId
      console.log("Definindo usuarioId a partir de userId:", lojaData.userId)
    } else if (lojaData.usuarioId && !lojaData.userId) {
      lojaData.userId = lojaData.usuarioId
      console.log("Definindo userId a partir de usuarioId:", lojaData.usuarioId)
    } else if (!lojaData.userId && !lojaData.usuarioId) {
      lojaData.userId = lojaData.proprietarioId
      lojaData.usuarioId = lojaData.proprietarioId
      console.log("Definindo userId e usuarioId a partir de proprietarioId:", lojaData.proprietarioId)
    }

    // Adicionar campos de data
    const novaLoja = {
      ...lojaData,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      horarioFuncionamento: {
        segunda: { open: true, abertura: "08:00", fechamento: "18:00" },
        terca: { open: true, abertura: "08:00", fechamento: "18:00" },
        quarta: { open: true, abertura: "08:00", fechamento: "18:00" },
        quinta: { open: true, abertura: "08:00", fechamento: "18:00" },
        sexta: { open: true, abertura: "08:00", fechamento: "18:00" },
        sabado: { open: false, abertura: "", fechamento: "" },
        domingo: { open: false, abertura: "", fechamento: "" },
      },
    }

    const result = await db.collection("lojas").insertOne(novaLoja)
    const lojaId = result.insertedId.toString()

    console.log("Loja criada com sucesso:", lojaId)

    // Atualizar o usuário com o lojaId
    await db.collection("usuarios").updateOne({ _id: lojaData.proprietarioId }, { $set: { lojaId: lojaId } })

    return NextResponse.json(
      {
        message: "Loja criada com sucesso",
        lojaId: lojaId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar loja:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const proprietarioId = searchParams.get("proprietarioId")
    const usuarioId = searchParams.get("usuarioId")
    const userId = searchParams.get("userId")

    const { db } = await connectToDatabase()

    // Definir a query com tipagem correta para MongoDB
    let query: Record<string, any> = {}

    if (proprietarioId || usuarioId || userId) {
      query = { $or: [] as Record<string, any>[] }

      if (proprietarioId) {
        ;(query.$or as Record<string, any>[]).push({ proprietarioId })
      }

      if (usuarioId) {
        ;(query.$or as Record<string, any>[]).push({ usuarioId })
      }

      if (userId) {
        ;(query.$or as Record<string, any>[]).push({ userId })
      }
    }

    console.log("Buscando lojas com query:", query)
    const lojas = await db.collection("lojas").find(query).toArray()
    console.log(`Encontradas ${lojas.length} lojas`)

    return NextResponse.json({ lojas }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar lojas:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
