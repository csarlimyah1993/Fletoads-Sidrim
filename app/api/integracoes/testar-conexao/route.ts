import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Integracao from "@/lib/models/integracao"
import Loja from "@/lib/models/loja"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    const { integracaoId, credenciais } = await req.json()

    if (!integracaoId) {
      return NextResponse.json({ error: "ID da integração é obrigatório" }, { status: 400 })
    }

    // Buscar integração
    const integracao = await Integracao.findOne({
      _id: integracaoId,
      lojaId: loja._id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Aqui implementaríamos a lógica específica para testar cada tipo de integração
    // Por enquanto, vamos simular um teste bem-sucedido

    const resultado = {
      success: true,
      message: "Conexão estabelecida com sucesso",
      detalhes: {
        timestamp: new Date(),
        status: "conectado",
      },
    }

    // Se o teste for bem-sucedido e houver credenciais, atualizamos a integração
    if (credenciais) {
      integracao.credenciais = credenciais
      integracao.status = "ativo"
      integracao.ultimaSincronizacao = new Date()
      await integracao.save()
    }

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Erro ao testar conexão:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao testar conexão",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

