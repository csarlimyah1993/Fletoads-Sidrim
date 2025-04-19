import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"
import Loja from "@/lib/models/loja"

// Listar integrações do WhatsApp
export async function GET() {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const integracoes = await WhatsappIntegracao.find({ userId: session.user.id })

    return NextResponse.json(integracoes)
  } catch (error) {
    console.error("Erro ao listar integrações do WhatsApp:", error)
    return NextResponse.json({ error: "Erro ao listar integrações do WhatsApp" }, { status: 500 })
  }
}

// Criar nova integração do WhatsApp
export async function POST(req: Request) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { nomeInstancia, evolutionApiUrl, apiKey } = await req.json()

    // Validar dados
    if (!nomeInstancia || !apiKey) {
      return NextResponse.json({ error: "Nome da instância e API Key são obrigatórios" }, { status: 400 })
    }

    // Verificar se já existe uma instância com esse nome
    const existente = await WhatsappIntegracao.findOne({ nomeInstancia })
    if (existente) {
      return NextResponse.json({ error: "Já existe uma instância com esse nome" }, { status: 400 })
    }

    // Buscar a loja do usuário
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    // Criar nova integração
    const integracao = new WhatsappIntegracao({
      userId: session.user.id,
      lojaId: loja?._id,
      nomeInstancia,
      evolutionApiUrl: evolutionApiUrl || "http://localhost:8080",
      apiKey,
      status: "pendente",
    })

    await integracao.save()

    return NextResponse.json(integracao, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar integração do WhatsApp:", error)
    return NextResponse.json({ error: "Erro ao criar integração do WhatsApp" }, { status: 500 })
  }
}

