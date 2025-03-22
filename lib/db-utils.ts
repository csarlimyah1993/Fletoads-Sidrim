import { connectToDatabase } from "./mongodb"

// Função para executar uma operação no banco de dados com retry
export async function executeWithRetry<T>(
  operation: (db: any) => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { db } = await connectToDatabase()
      return await operation(db)
    } catch (error) {
      console.error(`Tentativa ${attempt} falhou:`, error)
      lastError = error

      // Se não for a última tentativa, esperar antes de tentar novamente
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt))
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  throw lastError
}

