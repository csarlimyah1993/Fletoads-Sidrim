import { ObjectId } from "mongodb"

/**
 * Creates a MongoDB filter for finding a document by ID
 * This function handles both string IDs and ObjectId instances
 */
export function createIdFilter(id: string): { _id: ObjectId } | { [key: string]: any } {
  if (ObjectId.isValid(id)) {
    return { _id: new ObjectId(id) }
  }
  // For non-ObjectId values, use a different field like 'slug' or 'name'
  return { slug: id }
}

/**
 * Creates a MongoDB filter specifically for finding a document by ID
 * This function only returns an ObjectId filter and throws an error if the ID is invalid
 */
export function createObjectIdFilter(id: string): { _id: ObjectId } {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid ObjectId: ${id}`)
  }
  return { _id: new ObjectId(id) }
}

/**
 * Safely converts a string to ObjectId if valid, or returns null
 */
export function safeObjectId(id: string | ObjectId | null | undefined): ObjectId | null {
  if (!id) return null

  if (id instanceof ObjectId) return id

  if (typeof id === "string" && ObjectId.isValid(id)) {
    return new ObjectId(id)
  }

  return null
}

/**
 * Creates a MongoDB filter for user ID which could be in different formats
 */
export function createUserIdFilter(userId: string | ObjectId): object {
  const objectId = safeObjectId(userId)

  if (objectId) {
    return {
      $or: [{ usuarioId: objectId }, { userId: objectId }],
    }
  }

  // If not a valid ObjectId, try as string
  return {
    $or: [{ usuarioId: userId.toString() }, { userId: userId.toString() }, { email: userId.toString() }],
  }
}
