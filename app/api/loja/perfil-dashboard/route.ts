import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    const loja = await db.collection("lojas").findOne({
      proprietarioId: new ObjectId(session.user.id),
    })

    // Buscar informações do plano do usuário
    const usuario = await db.collection("usuarios").findOne({
      _id: new ObjectId(session.user.id),
    })

    // Definir plano padrão se não existir
    const planoNome = usuario?.plano || "gratuito"

    // Buscar detalhes do plano
    const plano = (await db.collection("planos").findOne({ nome: planoNome })) || {
      nome: planoNome,
      preco: 0,
      limites: {
        panfletos: 10,
        produtos: 20,
        clientes: 50,
        integracoes: 1,
      },
    }

    // Buscar uso atual dos recursos
    const panfletos = await db.collection("panfletos").countDocuments({
      usuarioId: new ObjectId(session.user.id),
    })

    const produtos = await db.collection("produtos").countDocuments({
      usuarioId: new ObjectId(session.user.id),
    })

    const clientes = await db.collection("clientes").countDocuments({
      usuarioId: new ObjectId(session.user.id),
    })

    const integracoes = await db.collection("integracoes").countDocuments({
      usuarioId: new ObjectId(session.user.id),
    })

    const uso = {
      panfletos,
      produtos,
      clientes,
      integracoes,
    }

    // Buscar configurações da vitrine
    const vitrine = loja
      ? await db.collection("vitrines").findOne({
          lojaId: loja._id,
        })
      : null

    return NextResponse.json({
      loja,
      plano,
      uso,
      vitrine,
    })
  } catch (error) {
    console.error("Erro ao buscar dados da loja:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
