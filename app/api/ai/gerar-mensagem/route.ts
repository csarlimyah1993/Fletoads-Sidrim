import { type NextRequest, NextResponse } from "next/server"
import { generateTogetherAIText, isTogetherAIConfigured } from "@/lib/together-ai"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const maxDuration = 30 // Aumentar o tempo máximo para 30 segundos

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se a TogetherAI está configurada
    if (!isTogetherAIConfigured()) {
      return NextResponse.json({ error: "API da TogetherAI não configurada" }, { status: 500 })
    }

    const { tipo, cliente, detalhes } = await req.json()

    // Construir o prompt para a IA
    const prompt = `
      Crie uma mensagem personalizada para um cliente com as seguintes características:
      
      Tipo de mensagem: ${tipo || "Geral"}
      Cliente: ${cliente ? JSON.stringify(cliente) : "Cliente genérico"}
      Detalhes adicionais: ${detalhes || "Sem detalhes adicionais"}
      
      A mensagem deve ser:
      1. Profissional e amigável
      2. Personalizada com base nas informações do cliente (se fornecidas)
      3. Concisa e direta
      4. Formatada adequadamente para envio por WhatsApp ou SMS
      
      Forneça apenas o texto da mensagem, sem comentários adicionais.
    `

    const systemPrompt =
      "Você é um especialista em marketing e comunicação com clientes. Seu objetivo é criar mensagens personalizadas e eficazes que gerem engajamento e conversão."

    // Gerar a mensagem usando a TogetherAI
    const text = await generateTogetherAIText(prompt, systemPrompt)

    return NextResponse.json({ mensagem: text })
  } catch (error) {
    console.error("Erro ao gerar mensagem:", error)
    return NextResponse.json({ error: "Erro ao gerar mensagem" }, { status: 500 })
  }
}

