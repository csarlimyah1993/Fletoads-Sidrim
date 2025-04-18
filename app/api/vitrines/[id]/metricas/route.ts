import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type ParamsContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: ParamsContext) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const query: any = { $or: [] }

    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) })
    }

    query.$or.push({ "vitrine.slug": id })
    query.$or.push({ vitrineId: id })

    const loja = await db.collection("lojas").findOne(query)

    if (!loja) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    const isProprietario =
      session &&
      (loja.proprietarioId === session.user.id ||
        loja.usuarioId === session.user.id ||
        session.user.role === "admin")

    if (!isProprietario) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const visualizacoes = await db
      .collection("vitrine_metricas")
      .countDocuments({ lojaId: loja._id.toString(), tipo: "visualizacao" })

    const interacoes = await db
      .collection("vitrine_metricas")
      .countDocuments({ lojaId: loja._id.toString(), tipo: "interacao" })

    const conversoes = await db
      .collection("vitrine_metricas")
      .countDocuments({ lojaId: loja._id.toString(), tipo: "conversao" })

    const cliques = await db
      .collection("vitrine_metricas")
      .countDocuments({ lojaId: loja._id.toString(), tipo: "clique" })

    return NextResponse.json({
      metricas: {
        visualizacoes,
        interacoes,
        conversoes,
        cliques,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar métricas:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: ParamsContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { tipo = "visualizacao", detalhes = {} } = body

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const query: any = { $or: [] }

    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) })
    }

    query.$or.push({ "vitrine.slug": id })
    query.$or.push({ vitrineId: id })

    const loja = await db.collection("lojas").findOne(query)

    if (!loja) {
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    const metrica = {
      lojaId: loja._id.toString(),
      tipo,
      data: new Date(),
      detalhes,
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    }

    await db.collection("vitrine_metricas").insertOne(metrica)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao registrar métrica:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
