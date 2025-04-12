import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem permissão para acessar esses dados
    if (session.user.id !== params.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { db } = await connectToDatabase()

    console.log(`Buscando loja para o usuário ${params.id}`)

    // Buscar o usuário para verificar o lojaId
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(params.id) })
    console.log("Usuário encontrado:", usuario ? "Sim" : "Não")
    console.log("LojaId do usuário:", usuario?.lojaId)

    let loja = null

    // Se o usuário tiver lojaId, buscar a loja diretamente
    if (usuario && usuario.lojaId) {
      try {
        loja = await db.collection("lojas").findOne({
          _id: typeof usuario.lojaId === "string" ? new ObjectId(usuario.lojaId) : usuario.lojaId,
        })
        console.log("Loja encontrada pelo lojaId:", loja ? "Sim" : "Não")
      } catch (error) {
        console.error("Erro ao buscar loja pelo lojaId:", error)
      }
    }

    // Se não encontrou a loja pelo lojaId, buscar pela proprietarioId ou usuarioId
    if (!loja) {
      loja = await db.collection("lojas").findOne({
        $or: [
          { proprietarioId: params.id },
          { proprietarioId: new ObjectId(params.id) },
          { usuarioId: params.id },
          { usuarioId: new ObjectId(params.id) },
        ],
      })
      console.log("Loja encontrada por proprietarioId/usuarioId:", loja ? "Sim" : "Não")
    }

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    console.log("Loja encontrada:", loja._id.toString(), loja.nome)

    // Buscar produtos da loja
    const produtos = await db
      .collection("produtos")
      .find({ lojaId: loja._id.toString() })
      .limit(8)
      .sort({ destaque: -1, dataCriacao: -1 })
      .toArray()

    console.log(`Encontrados ${produtos.length} produtos`)

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

    // Buscar informações do plano
    let planoInfo = null
    if (usuario && usuario.plano) {
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
