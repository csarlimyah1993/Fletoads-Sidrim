import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || session.user.id

    console.log(`API /api/loja - Buscando loja para o usuário: ${userId}`)

    const { db } = await connectToDatabase()

    // Buscar o usuário para verificar o lojaId
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
    console.log("API /api/loja - Usuário encontrado:", usuario ? "Sim" : "Não")
    console.log("API /api/loja - LojaId do usuário:", usuario?.lojaId)

    let loja = null

    // Se o usuário tiver lojaId, buscar a loja diretamente
    if (usuario && usuario.lojaId) {
      try {
        loja = await db.collection("lojas").findOne({
          _id: typeof usuario.lojaId === "string" ? new ObjectId(usuario.lojaId) : usuario.lojaId,
        })
        console.log("API /api/loja - Loja encontrada pelo lojaId:", loja ? "Sim" : "Não")
      } catch (error) {
        console.error("API /api/loja - Erro ao buscar loja pelo lojaId:", error)
      }
    }

    // Se não encontrou a loja pelo lojaId, buscar pela proprietarioId ou usuarioId
    if (!loja) {
      loja = await db.collection("lojas").findOne({
        $or: [
          { proprietarioId: userId },
          { proprietarioId: new ObjectId(userId) },
          { usuarioId: userId },
          { usuarioId: new ObjectId(userId) },
        ],
      })
      console.log("API /api/loja - Loja encontrada por proprietarioId/usuarioId:", loja ? "Sim" : "Não")
    }

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    console.log("API /api/loja - Loja encontrada:", loja._id.toString(), loja.nome)

    // Buscar produtos da loja
    const produtos = await db
      .collection("produtos")
      .find({ lojaId: loja._id.toString() })
      .limit(8)
      .sort({ destaque: -1, dataCriacao: -1 })
      .toArray()

    console.log(`API /api/loja - Encontrados ${produtos.length} produtos`)

    // Serializar os dados para evitar erros de serialização
    const serializableLoja = {
      ...loja,
      _id: loja._id.toString(),
      dataCriacao: loja.dataCriacao ? loja.dataCriacao.toISOString() : null,
      dataAtualizacao: loja.dataAtualizacao ? loja.dataAtualizacao.toISOString() : null,
    }

    const serializableProdutos = produtos.map((produto) => ({
      ...produto,
      _id: produto._id.toString(),
      dataCriacao: produto.dataCriacao ? produto.dataCriacao.toISOString() : null,
      dataAtualizacao: produto.dataAtualizacao ? produto.dataAtualizacao.toISOString() : null,
    }))

    return NextResponse.json({
      loja: serializableLoja,
      produtos: serializableProdutos,
    })
  } catch (error) {
    console.error("API /api/loja - Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
