import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ⬅️ await necessário aqui!

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (session.user.id !== id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { db } = await connectToDatabase()

    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(id) })

    let loja = null

    if (usuario && usuario.lojaId) {
      try {
        loja = await db.collection("lojas").findOne({
          _id: typeof usuario.lojaId === "string" ? new ObjectId(usuario.lojaId) : usuario.lojaId,
        })
      } catch (error) {
        console.error("Erro ao buscar loja pelo lojaId:", error)
      }
    }

    if (!loja) {
      loja = await db.collection("lojas").findOne({
        $or: [
          { proprietarioId: id },
          { proprietarioId: new ObjectId(id) },
          { usuarioId: id },
          { usuarioId: new ObjectId(id) },
        ],
      })
    }

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const produtos = await db
      .collection("produtos")
      .find({ lojaId: loja._id.toString() })
      .limit(8)
      .sort({ destaque: -1, dataCriacao: -1 })
      .toArray()

    const serializableLoja = {
      ...loja,
      _id: loja._id.toString(),
      dataCriacao: loja.dataCriacao?.toISOString() ?? null,
      dataAtualizacao: loja.dataAtualizacao?.toISOString() ?? null,
    }

    const serializableProdutos = produtos.map((produto) => ({
      ...produto,
      _id: produto._id.toString(),
      dataCriacao: produto.dataCriacao?.toISOString() ?? null,
      dataAtualizacao: produto.dataAtualizacao?.toISOString() ?? null,
    }))

    let planoInfo = null
    if (usuario?.plano) {
      planoInfo = {
        nome: usuario.plano,
        panfletos: { usado: 0, limite: usuario.plano === "premium" ? 100 : 10 },
        produtos: { usado: produtos.length, limite: usuario.plano === "premium" ? 1000 : 100 },
        integracoes: { usado: 0, limite: usuario.plano === "premium" ? 10 : 1 },
      }
    }

    return NextResponse.json({
      loja: serializableLoja,
      produtos: serializableProdutos,
      planoInfo,
    })
  } catch (error) {
    console.error("Erro ao buscar loja do usuário:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
