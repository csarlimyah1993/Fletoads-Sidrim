import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter dados do corpo da requisição
    const data = await request.json()

    // Validar dados
    if (!data.assinaturaId || data.aceito === undefined) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Verificar se a assinatura existe e pertence ao usuário
    const assinatura = await db.collection("assinaturas").findOne({
      _id: new ObjectId(data.assinaturaId),
      userId: session.user.id,
    })

    if (!assinatura) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 })
    }

    // Atualizar assinatura
    await db.collection("assinaturas").updateOne(
      { _id: new ObjectId(data.assinaturaId) },
      {
        $set: {
          contratoAceito: data.aceito,
          dataAceiteContrato: new Date(),
          status: "ativo",
        },
      },
    )

    // Atualizar plano do usuário
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          plano: assinatura.plano,
          dataAtualizacaoPlano: new Date(),
        },
      },
    )

    // Criar notificação para o usuário
    await db.collection("notificacoes").insertOne({
      userId: session.user.id,
      tipo: "plano",
      titulo: "Plano Ativado",
      mensagem: `Seu plano ${assinatura.plano} foi ativado com sucesso!`,
      lida: false,
      data: new Date(),
    })

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: "Contrato assinado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao assinar contrato:", error)
    return NextResponse.json({ error: "Erro ao assinar contrato" }, { status: 500 })
  }
}

