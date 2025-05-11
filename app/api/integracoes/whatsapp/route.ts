import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"
import Loja from "@/lib/models/loja"
import Usuario from "@/lib/models/usuario"
// import { ENV } from "@/lib/env-config" // Removido: não mais utilizado após refatoração do POST
// import { createInstance } from "@/lib/utils/evolution-api" // Removido: POST não cria mais instâncias na Evolution API

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
    console.log(integracoes)
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

    // Validar campos básicos obrigatórios
    if (!dados.evolutionApiUrl || typeof dados.evolutionApiUrl !== 'string' || dados.evolutionApiUrl.trim() === '') {
        return NextResponse.json({ error: "O campo 'evolutionApiUrl' é obrigatório e deve ser uma string não vazia." }, { status: 400 });
    }
    if (!dados.telefone || typeof dados.telefone !== 'string' || dados.telefone.trim() === '') {
        return NextResponse.json({ error: "O campo 'telefone' é obrigatório e deve ser uma string não vazia." }, { status: 400 });
    }
    if (!dados.evolutionApiData || typeof dados.evolutionApiData !== 'object' || dados.evolutionApiData === null || Array.isArray(dados.evolutionApiData)) {
        return NextResponse.json({ error: "O campo 'evolutionApiData' é obrigatório e deve ser um objeto válido." }, { status: 400 });
    }

    // Extrair e validar os dados da instância, com fallback para evolutionApiData
    const nomeInstancia = dados.nomeInstancia || dados.evolutionApiData?.instance?.instanceName;
    const instanceId = dados.instanceId || dados.evolutionApiData?.instance?.instanceId;
    const apiKey = dados.apiKey || dados.evolutionApiData?.hash;
    const status = dados.status || dados.evolutionApiData?.instance?.status;

    if (!nomeInstancia || typeof nomeInstancia !== 'string' || nomeInstancia.trim() === '') {
        return NextResponse.json({ error: "O campo 'nomeInstancia' é obrigatório (diretamente ou via evolutionApiData.instance.instanceName) e deve ser uma string não vazia." }, { status: 400 });
    }
    if (!instanceId || typeof instanceId !== 'string' || instanceId.trim() === '') {
        return NextResponse.json({ error: "O campo 'instanceId' é obrigatório (diretamente ou via evolutionApiData.instance.instanceId) e deve ser uma string não vazia." }, { status: 400 });
    }
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
        return NextResponse.json({ error: "O campo 'apiKey' é obrigatório (diretamente ou via evolutionApiData.hash) e deve ser uma string não vazia." }, { status: 400 });
    }
    if (!status || typeof status !== 'string' || status.trim() === '') {
        return NextResponse.json({ error: "O campo 'status' é obrigatório (diretamente ou via evolutionApiData.instance.status) e deve ser uma string não vazia." }, { status: 400 });
    }
    
    // Verificar se já existe uma instância com o mesmo nome (globalmente, conforme lógica original)
    const instanciaExistente = await WhatsappIntegracao.findOne({ nomeInstancia: nomeInstancia })
    if (instanciaExistente) {
      return NextResponse.json({ error: "Já existe uma instância com este nome." }, { status: 409 })
    }

    // Buscar a loja do usuário (opcional)
    let lojaId = null
    const loja = await Loja.findOne({ proprietarioId: session.user.id })
    if (loja) {
      lojaId = loja._id
    }

    // Os dados da Evolution API são fornecidos diretamente na requisição
    const evolutionApiData = dados.evolutionApiData; // Manter esta linha para clareza ao acessar nested props.

    // Criar a integração no banco de dados
    const integracao = new WhatsappIntegracao({
      userId: session.user.id,
      lojaId: lojaId,
      nomeInstancia: nomeInstancia, // Usar variável derivada e validada
      status: status, // Usar variável derivada e validada
      telefone: dados.telefone, // Diretamente de dados, já validado
      evolutionApiUrl: dados.evolutionApiUrl, // Diretamente de dados, já validado
      apiKey: apiKey, // Usar variável derivada e validada
      instanceId: instanceId, // Usar variável derivada e validada
      evolutionApiData: evolutionApiData // Usar a variável atribuída, que é dados.evolutionApiData
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

