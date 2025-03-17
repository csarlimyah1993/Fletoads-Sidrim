// Direct API integration with Together AI

export function isTogetherAIConfigured(): boolean {
    return !!process.env.TOGETHER_API_KEY
  }
  
  export async function generateTogetherAIText(
    prompt: string,
    systemPrompt = "Você é um assistente útil especializado em marketing e criação de conteúdo.",
  ): Promise<string> {
    if (!isTogetherAIConfigured()) {
      throw new Error("API da TogetherAI não configurada")
    }
  
    try {
      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
        body: JSON.stringify({
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
        }),
      })
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
  
      const data = await response.json()
      return data.choices[0]?.message?.content || ""
    } catch (error) {
      console.error("Erro ao gerar texto com Together AI:", error)
      throw error
    }
  }
  
  