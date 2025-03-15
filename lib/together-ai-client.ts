// Cliente para a API da Together AI

export async function generateTogetherAIContent(prompt: string) {
    const apiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY || process.env.TOGETHER_API_KEY
  
    if (!apiKey) {
      throw new Error("API da TogetherAI não configurada")
    }
  
    const url = "https://api.together.xyz/v1/chat/completions"
  
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-72B-Instruct-Turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente especializado em marketing e publicidade, focado em criar conteúdo persuasivo e eficaz para materiais promocionais.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    }
  
    try {
      const response = await fetch(url, options)
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Erro ao gerar conteúdo")
      }
  
      const data = await response.json()
      return data.choices[0].message.content
    } catch (error: any) {
      console.error("Erro na API da Together AI:", error)
      throw new Error(error.message || "Erro ao gerar conteúdo")
    }
  }
  
  