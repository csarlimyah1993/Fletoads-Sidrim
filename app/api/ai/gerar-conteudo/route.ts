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

    const { titulo, categoria, publico, tom, pontosPrincipais } = await req.json()

    if (!titulo || !categoria) {
      return NextResponse.json({ error: "Título e categoria são obrigatórios" }, { status: 400 })
    }

    // Construir o prompt para a IA
    const prompt = `
    Crie um conteúdo para um panfleto publicitário com as seguintes características:
    
    Título: ${titulo}
    Categoria: ${categoria}
    Público-alvo: ${publico || "Geral"}
    Tom de comunicação: ${tom || "Profissional"}
    
    Pontos principais a serem abordados:
    ${pontosPrincipais ? pontosPrincipais.join("\n") : "Destaque os benefícios principais do produto/serviço"}
    
    O conteúdo deve incluir:
    1. Um slogan cativante
    2. Uma breve descrição do produto/serviço
    3. Os principais benefícios
    4. Uma chamada para ação clara
    
    Formate o conteúdo de forma estruturada e atraente para um panfleto publicitário.
  `

    const systemPrompt =
      "Você é um especialista em marketing e publicidade, especializado em criar conteúdo persuasivo e eficaz para materiais promocionais. Seu objetivo é criar conteúdo que seja atraente, claro e que converta o público-alvo em clientes."

    // Gerar o conteúdo usando a TogetherAI
    const text = await generateTogetherAIText(prompt, systemPrompt)

    return NextResponse.json({ conteudo: text })
  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error)
    return NextResponse.json({ error: "Erro ao gerar conteúdo" }, { status: 500 })
  }
}

