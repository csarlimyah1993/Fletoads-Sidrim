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

    const { conteudo, publico } = await req.json()

    if (!conteudo) {
      return NextResponse.json({ error: "Conteúdo é obrigatório" }, { status: 400 })
    }

    // Construir o prompt para a IA
    const prompt = `
    Analise o seguinte conteúdo de panfleto publicitário:
    
    "${conteudo}"
    
    Público-alvo: ${publico || "Geral"}
    
    Forneça uma análise detalhada considerando:
    1. Eficácia da mensagem principal
    2. Clareza e persuasão
    3. Adequação ao público-alvo
    4. Pontos fortes
    5. Sugestões de melhoria
    
    Formate sua análise de forma estruturada e profissional.
  `

    const systemPrompt =
      "Você é um especialista em marketing e análise de conteúdo publicitário. Seu objetivo é fornecer feedback construtivo e insights valiosos para melhorar a eficácia de materiais promocionais."

    // Gerar a análise usando a TogetherAI
    const text = await generateTogetherAIText(prompt, systemPrompt)

    return NextResponse.json({ analise: text })
  } catch (error) {
    console.error("Erro ao analisar conteúdo:", error)
    return NextResponse.json({ error: "Erro ao analisar conteúdo" }, { status: 500 })
  }
}

