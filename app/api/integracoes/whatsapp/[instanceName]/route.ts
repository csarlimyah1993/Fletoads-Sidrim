import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"

// Atualizar status da instância do WhatsApp
export async function PATCH(
  request: Request,
  { params }: { params: { instanceName: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const { instanceName } = params
    if (!instanceName) {
      return NextResponse.json({ error: "Nome da instância é obrigatório" }, { status: 400 })
    }

    // Buscar a instância pelo nome
    const integracao = await WhatsappIntegracao.findOne({ nomeInstancia: instanceName })
    if (!integracao) {
      return NextResponse.json({ error: "Instância não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário é o proprietário da instância
    if (integracao.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado a modificar esta instância" }, { status: 403 })
    }

    // Obter dados da requisição
    const dados = await request.json()

    // Atualizar os campos permitidos
    if (dados.status) {
      integracao.status = dados.status
    }

    if (dados.telefone) {
      integracao.telefone = dados.telefone
    }

    if (dados.ultimaConexao) {
      integracao.ultimaConexao = new Date(dados.ultimaConexao)
    }

    // Salvar as alterações
    await integracao.save()

    return NextResponse.json({
      integracao,
      message: "Instância atualizada com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar instância WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar instância WhatsApp", details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Excluir instância do WhatsApp
export async function DELETE(
  request: Request,
  { params }: { params: { instanceName: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const { instanceName } = params
    if (!instanceName) {
      return NextResponse.json({ error: "Nome da instância é obrigatório" }, { status: 400 })
    }

    // Buscar a instância pelo nome
    const integracao = await WhatsappIntegracao.findOne({ nomeInstancia: instanceName })
    if (!integracao) {
      return NextResponse.json({ error: "Instância não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário é o proprietário da instância
    if (integracao.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado a excluir esta instância" }, { status: 403 })
    }

    // Excluir a instância
    await WhatsappIntegracao.deleteOne({ _id: integracao._id })

    return NextResponse.json({
      message: "Instância excluída com sucesso"
    })
  } catch (error) {
    console.error("Erro ao excluir instância WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro ao excluir instância WhatsApp", details: (error as Error).message },
      { status: 500 }
    )
  }
}