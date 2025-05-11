import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"
import Loja from "@/lib/models/loja"
import Usuario from "@/lib/models/usuario"
import { ENV } from "@/lib/env-config"
import { createInstance } from "@/lib/utils/evolution-api"

// Listar integrações do WhatsApp
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar o usuário para verificar o plano
    const usuario = await Usuario.findOne({ email: session.user.email })
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar integrações do usuário
    const integracoes = await WhatsappIntegracao.find({ userId: session.user.id })

    // Verificar limite de contas WhatsApp com base no plano
    let limiteContasWhatsapp = 1 // Padrão para plano gratuito

    if (usuario.plano === "premium") {
      limiteContasWhatsapp = 5
    } else if (usuario.plano === "business") {
      limiteContasWhatsapp = 3
    }

    const limiteAtingido = integracoes.length >= limiteContasWhatsapp

    return NextResponse.json({
      integracoes,
      limiteContasWhatsapp,
      limiteAtingido,
    })
  } catch (error) {
    console.error("Erro ao listar integrações WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro ao listar integrações WhatsApp", details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Criar nova integração do WhatsApp
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar o usuário para verificar o plano
    const usuario = await Usuario.findOne({ email: session.user.email })
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar limite de contas WhatsApp com base no plano
    let limiteContasWhatsapp = 1 // Padrão para plano gratuito

    if (usuario.plano === "premium") {
      limiteContasWhatsapp = 5
    } else if (usuario.plano === "business") {
      limiteContasWhatsapp = 3
    }

    // Contar integrações existentes
    const integracoesCount = await WhatsappIntegracao.countDocuments({ userId: session.user.id })

    // Verificar se o limite foi atingido
    if (integracoesCount >= limiteContasWhatsapp) {
      // Buscar integrações existentes para garantir que sempre retornamos o array
      const integracoes = await WhatsappIntegracao.find({ userId: session.user.id });
      return NextResponse.json(
        { 
          error: "Limite de contas WhatsApp atingido", 
          limiteAtingido: true,
          usado: integracoesCount,
          limite: limiteContasWhatsapp,
          integracoes
        }, 
        { status: 403 }
      )
    }

    // Obter dados da requisição
    const dados = await request.json()

    // Validar dados
    if (!dados.nomeInstancia) {
      return NextResponse.json({ error: "Nome da instância é obrigatório" }, { status: 400 })
    }

    // Verificar se já existe uma instância com o mesmo nome
    const instanciaExistente = await WhatsappIntegracao.findOne({ nomeInstancia: dados.nomeInstancia })
    if (instanciaExistente) {
      return NextResponse.json({ error: "Já existe uma instância com este nome" }, { status: 409 })
    }

    // Buscar a loja do usuário (opcional)
    let lojaId = null
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (loja) {
      lojaId = loja._id
    }

    // --- INÍCIO DA CHAMADA À EVOLUTION API ---
    let evolutionApiData = null
    try {
      evolutionApiData = await createInstance({
        instanceName: dados.nomeInstancia,
        qrcode: true,
        number: dados.telefone,
        integration: "WHATSAPP-BAILEYS"
      })
    } catch (err) {
      return NextResponse.json({ error: "Erro ao criar instância na Evolution API", details: (err as Error).message }, { status: 502 })
    }
    // --- FIM DA CHAMADA À EVOLUTION API ---

    // Criar a integração no banco de dados
    const integracao = new WhatsappIntegracao({
      userId: session.user.id,
      lojaId: lojaId,
      nomeInstancia: dados.nomeInstancia,
      status: evolutionApiData?.instance?.status || "pendente",
      telefone: dados.telefone,
      evolutionApiUrl: ENV.EVOLUTION_API_BASE_URL,
      apiKey: ENV.EVOLUTION_API_KEY,
      instanceId: evolutionApiData?.instance?.instanceId || null,
      evolutionApiData: evolutionApiData
    })

    // Salvar campos úteis do retorno da API diretamente na integração
    if (evolutionApiData?.qrcode) {
      integracao.set("qrcode", evolutionApiData.qrcode.base64 || null)
      integracao.set("pairingCode", evolutionApiData.qrcode.pairingCode || null)
    }
    if (evolutionApiData?.instance) {
      integracao.set("instanceInfo", evolutionApiData.instance)
    }

    await integracao.save()

    // Contar novamente para retornar os valores atualizados
    const novoCount = await WhatsappIntegracao.countDocuments({ userId: session.user.id })

    return NextResponse.json({
      integracao,
      usado: novoCount,
      limite: limiteContasWhatsapp,
      message: "Instância criada com sucesso"
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar integração WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro ao criar integração WhatsApp", details: (error as Error).message },
      { status: 500 }
    )
  }
}

