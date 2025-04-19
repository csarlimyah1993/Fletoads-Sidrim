import { type NextRequest, NextResponse } from "next/server"
import { generateTogetherAIText, isTogetherAIConfigured } from "@/lib/together-ai"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"

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

    const { conteudo, metricas } = await req.json()

    if (!conteudo) {
      return NextResponse.json({ error: "Conteúdo é obrigatório" }, { status: 400 })
    }

    // Construir o prompt para a IA
    const prompt = `
    Com base no seguinte conteúdo de panfleto publicitário:
    
    "${conteudo}"
    
    ${
      metricas
        ? `E considerando as seguintes métricas de desempenho:
    ${JSON.stringify(metricas, null, 2)}`
        : ""
    }
    
    Sugira melhorias específicas para aumentar a eficácia do panfleto, incluindo:
    1. Reformulação do título/slogan (se necessário)
    2. Ajustes no texto principal
    3. Melhorias na chamada para ação
    4. Sugestões de elementos visuais ou design
    5. Versão revisada do conteúdo completo
    
    Forneça sugestões práticas e específicas que possam ser implementadas imediatamente.
  `

    const systemPrompt =
      "Você é um especialista em otimização de conteúdo publicitário com anos de experiência em marketing. Seu objetivo é fornecer sugestões práticas e específicas para melhorar materiais promocionais, baseando-se em princípios comprovados de persuasão e conversão."

    // Gerar as sugestões usando a TogetherAI
    const text = await generateTogetherAIText(prompt, systemPrompt)

    return NextResponse.json({ sugestoes: text })
  } catch (error) {
    console.error("Erro ao sugerir melhorias:", error)
    return NextResponse.json({ error: "Erro ao sugerir melhorias" }, { status: 500 })
  }
}

