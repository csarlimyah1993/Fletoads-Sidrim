import { ObjectId, type Filter, type Document } from "mongodb"

/**
 * Cria um filtro seguro para buscar por ID no MongoDB
 * Resolve o problema de tipagem quando se usa string ou ObjectId
 */
export function createIdFilter(id: string | ObjectId): Filter<Document> {
  // Se já for um ObjectId, usar diretamente
  if (id instanceof ObjectId) {
    return { _id: id }
  }

  // Tentar converter para ObjectId
  try {
    return { _id: new ObjectId(id) }
  } catch (error) {
    // Se falhar, usar uma condição alternativa
    return {
      $or: [{ _id: id }, { slug: id }, { nomeNormalizado: id.toLowerCase().replace(/\s+/g, "-") }],
    }
  }
}

