import type { NextRequest } from "next/server"
import { generateTogetherAIStream, isTogetherAIConfigured } from "@/lib/together-ai"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const maxDuration = 60 // Aumentar o tempo máximo para 60 segundos

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verificar se a TogetherAI está configurada
    if (!isTogetherAIConfigured()) {
      return new Response(JSON.stringify({ error: "API da TogetherAI não configurada" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { prompt, systemPrompt } = await req.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Gerar o stream usando a TogetherAI
    const stream = await generateTogetherAIStream(prompt, systemPrompt)

    // Criar um TransformStream para processar os chunks
    const encoder = new TextEncoder()
    const { readable, writable } = new TransformStream()

    // Processar o stream
    const writer = writable.getWriter()
    ;(async () => {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ""
          await writer.write(encoder.encode(text))
        }
      } catch (error) {
        console.error("Erro no streaming:", error)
      } finally {
        await writer.close()
      }
    })()

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error)
    return new Response(JSON.stringify({ error: "Erro ao gerar conteúdo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

