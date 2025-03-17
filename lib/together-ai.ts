import Together from "together-ai"

// Check if Together AI is configured
export function isTogetherAIConfigured(): boolean {
  return !!process.env.TOGETHER_API_KEY
}

// Initialize the Together AI client
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
})

// Generate text using Together AI
export async function generateTogetherAIText(
  prompt: string,
  systemPrompt = "Você é um assistente útil especializado em marketing e criação de conteúdo.",
): Promise<string> {
  if (!isTogetherAIConfigured()) {
    throw new Error("API da TogetherAI não configurada")
  }

  try {
    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1,
      stop: ["<|eot_id|>", "<|eom_id|>"],
      safety_model: "meta-llama/Meta-Llama-Guard-3-8B",
    })

    return response.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("Erro ao gerar texto com Together AI:", error)
    throw error
  }
}

export async function generateTogetherAIStream(
  prompt: string,
  systemPrompt = "Você é um assistente útil especializado em marketing e criação de conteúdo.",
): Promise<any> {
  if (!isTogetherAIConfigured()) {
    throw new Error("API da TogetherAI não configurada")
  }

  try {
    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1,
      stop: ["<|eot_id|>", "<|eom_id|>"],
      safety_model: "meta-llama/Meta-Llama-Guard-3-8B",
      stream: true,
    })

    return response
  } catch (error) {
    console.error("Erro ao gerar texto com Together AI:", error)
    throw error
  }
}

