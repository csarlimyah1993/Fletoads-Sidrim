import { ObjectId } from "mongodb"

/**
 * Serializa um objeto do MongoDB para um objeto JavaScript simples
 * Converte ObjectId para string e Date para ISO string
 */
export function serializeMongoObject<T>(obj: any): T {
  if (!obj) return obj

  const serialized: any = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof ObjectId) {
      serialized[key] = value.toString()
    } else if (value instanceof Date) {
      serialized[key] = value.toISOString()
    } else if (typeof value === "object" && value !== null) {
      // Fix: Use the 'in' operator to check if 'buffer' property exists
      if ('buffer' in value) {
        // Se for um objeto com buffer (como BSON Binary), converter para string
        serialized[key] = String(value)
      } else {
        serialized[key] = serializeMongoObject(value)
      }
    } else {
      serialized[key] = value
    }
  }

  return serialized as T
}