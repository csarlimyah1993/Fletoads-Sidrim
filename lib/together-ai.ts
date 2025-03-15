// Configuração para a API da TogetherAI
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

// Função para validar se a chave API está configurada
export function isTogetherAIConfigured(): boolean {
  return !!process.env.TOGETHER_API_KEY
}

// Função para gerar texto usando a API da TogetherAI
export async function generateTogetherAIText(prompt: string, systemPrompt = ""): Promise<string> {
  if (!isTogetherAIConfigured()) {
    throw new Error("API da TogetherAI não configurada")
  }

  try {
    const fullPrompt = systemPrompt
      ? `<s>[INST] ${systemPrompt} [/INST]

[INST] ${prompt} [/INST]</s>`
      : `<s>[INST] ${prompt} [/INST]</s>`

    const response = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt: fullPrompt,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: 1.0,
        stop: ["</s>", "[/INST]"],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro na API da TogetherAI: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data.choices[0].text.trim()
  } catch (error) {
    console.error("Erro ao gerar texto com TogetherAI:", error)
    throw error
  }
}

