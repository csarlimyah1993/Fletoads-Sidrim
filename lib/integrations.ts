import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export async function getIntegrationById(id: string, userId?: string) {
  try {
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Database connection failed")
    }

    const collection = db.collection("integrations")

    const query = userId ? { _id: new ObjectId(id), userId: userId } : { _id: new ObjectId(id) }

    const integration = await collection.findOne(query)

    if (!integration) return null

    return {
      id: integration._id.toString(),
      name: integration.name,
      type: integration.type,
      userId: integration.userId,
      settings: integration.settings || {},
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    }
  } catch (error) {
    console.error("Error fetching integration:", error)
    return null
  }
}

export async function updateIntegration(id: string, userId: string, data: any) {
  try {
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Database connection failed")
    }

    const collection = db.collection("integrations")

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId: userId },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("Error updating integration:", error)
    return false
  }
}

export async function getAllIntegrations(userId: string) {
  try {
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Database connection failed")
    }

    const collection = db.collection("integrations")

    const integrations = await collection.find({ userId: userId }).sort({ createdAt: -1 }).toArray()

    return integrations.map((integration) => ({
      id: integration._id.toString(),
      name: integration.name as string,
      type: integration.type as string,
      userId: integration.userId as string,
      settings: (integration.settings as Record<string, any>) || {},
      createdAt: integration.createdAt as Date,
      updatedAt: integration.updatedAt as Date,
    }))
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return []
  }
}

export async function createIntegration(data: any) {
  try {
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Database connection failed")
    }

    const collection = db.collection("integrations")

    const now = new Date()
    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    })

    return {
      id: result.insertedId.toString(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }
  } catch (error) {
    console.error("Error creating integration:", error)
    return null
  }
}

export async function deleteIntegration(id: string, userId: string) {
  try {
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Database connection failed")
    }

    const collection = db.collection("integrations")

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId: userId,
    })

    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting integration:", error)
    return false
  }
}
