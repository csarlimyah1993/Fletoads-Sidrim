import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getSessionUser } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = getSessionUser(session)

    // Verificar autenticação
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { cupomId, valorPedido, valorDesconto } = body

    if (!cupomId || valorPedido === undefined || valorDesconto === undefined) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o cupom existe
    const cupom = await db.collection("cupons").findOne({
      _id: new ObjectId(cupomId),
      lojaId: user.lojaId,
      ativo: true,
    })

    if (!cupom) {
      return NextResponse.json({ error: "Cupom não encontrado ou inativo" }, { status: 404 })
    }

    // Registrar uso do cupom
    const usoData = {
      cupomId,
      usuarioId: user.id,
      dataUso: new Date(),
      valorPedido,
      valorDesconto,
    }

    await db.collection("usos_cupom").insertOne(usoData)

    // Incrementar contador de usos do cupom
    await db.collection("cupons").updateOne({ _id: new ObjectId(cupomId) }, { $inc: { usos: 1 } })

    return NextResponse.json({ message: "Uso do cupom registrado com sucesso" })
  } catch (error) {
    console.error("Erro ao registrar uso do cupom:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
