import { ObjectId, type Filter } from "mongodb"

/**
 * Cria um filtro de ID para MongoDB que aceita tanto string quanto ObjectId
 * @param id ID como string ou ObjectId
 * @returns Filtro para usar em consultas MongoDB
 */
export function createIdFilter(id: string | ObjectId): Filter<Document> {
  if (typeof id === "string" && ObjectId.isValid(id)) {
    return { _id: new ObjectId(id) }
  } else if (id instanceof ObjectId) {
    return { _id: id }
  }
  // Fallback para string, embora isso possa não funcionar com MongoDB
  return { _id: id as any }
}
